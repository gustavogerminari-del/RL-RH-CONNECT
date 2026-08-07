import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/db.js';
import { isValidCPF, cleanCPF } from './src/utils/cpf.js';
import { extractResumeData, calculateAIFitScore } from './src/server/gemini.js';
import { Application, Candidate, CandidateDocument, Job } from './src/types.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsers with large limit for base64 attachments/resumes
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // --- API ROUTES ---

  // 1. PUBLIC PORTAL ENDPOINTS
  app.get('/api/public/settings', (req, res) => {
    const settings = db.getPortalSettings();
    const metrics = db.getSystemMetrics();
    res.json({ settings, metrics });
  });

  app.get('/api/public/jobs', (req, res) => {
    const {
      search,
      location,
      workMode,
      contractType,
      area,
      salaryMin,
      experienceLevel,
      educationLevel
    } = req.query;

    let jobs = db.getJobs(true);

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.toLowerCase().trim();
      jobs = jobs.filter(
        j =>
          j.title.toLowerCase().includes(q) ||
          j.companyName.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q) ||
          j.area.toLowerCase().includes(q)
      );
    }

    if (location && typeof location === 'string' && location.trim()) {
      const loc = location.toLowerCase().trim();
      jobs = jobs.filter(
        j => j.city.toLowerCase().includes(loc) || j.state.toLowerCase().includes(loc)
      );
    }

    if (workMode && typeof workMode === 'string' && workMode !== 'todos') {
      jobs = jobs.filter(j => j.workMode === workMode);
    }

    if (contractType && typeof contractType === 'string' && contractType !== 'todos') {
      jobs = jobs.filter(j => j.contractType === contractType);
    }

    if (area && typeof area === 'string' && area !== 'todas') {
      jobs = jobs.filter(j => j.area === area);
    }

    if (salaryMin && !isNaN(Number(salaryMin))) {
      const minVal = Number(salaryMin);
      jobs = jobs.filter(j => (j.salaryMax || j.salaryMin || 0) >= minVal);
    }

    res.json({ jobs, total: jobs.length });
  });

  app.get('/api/public/jobs/:id', (req, res) => {
    const { id } = req.params;
    const job = db.getJobById(id);

    if (!job) {
      return res.status(404).json({ error: 'Esta oportunidade não está mais disponível.' });
    }

    const company = db.getCompanyById(job.companyId);
    if (job.status !== 'aberta' || !job.published || (company && !company.active)) {
      return res.status(404).json({
        error: 'Esta oportunidade não está mais disponível.',
        isExpired: true
      });
    }

    res.json({ job });
  });

  // EASY APPLY ENDPOINT (/api/public/apply)
  app.post('/api/public/apply', async (req, res) => {
    try {
      const {
        jobId,
        personalData,
        resumeFile,
        documents,
        questionAnswers,
        lgpdAccepted,
        bancoTalentos
      } = req.body;

      if (!jobId || !personalData) {
        return res.status(400).json({ error: 'Dados incompletos da candidatura.' });
      }

      const job = db.getJobById(jobId);
      if (!job || job.status !== 'aberta') {
        return res.status(404).json({ error: 'Esta vaga não aceita mais candidaturas.' });
      }

      // 1. CPF Validation
      const cpfRaw = personalData.cpf || '';
      if (!isValidCPF(cpfRaw)) {
        return res
          .status(400)
          .json({ error: 'CPF informado é inválido. Por favor, verifique os dígitos.' });
      }

      const cleanCpfVal = cleanCPF(cpfRaw);

      // 2. Identify or Create Candidate
      let candidate = db.findCandidateByCpf(cleanCpfVal);
      const candidateId = candidate ? candidate.id : `CAN-${Date.now()}`;

      // 3. Duplicate Application Check
      const existingApp = db.findActiveApplication(candidateId, jobId);
      if (existingApp) {
        return res.status(409).json({
          error: 'Você já se candidatou para esta oportunidade.',
          alreadyApplied: true,
          applicationId: existingApp.id
        });
      }

      // 4. Process Resume & AI Extraction
      let resumeExtractedData = candidate?.resumeExtractedData;
      if (resumeFile && resumeFile.fileContent) {
        // Read text/base64 from resume
        const resumeTextContent =
          resumeFile.textContent ||
          Buffer.from(
            resumeFile.fileContent.replace(/^data:[^;]+;base64,/, ''),
            'base64'
          ).toString('utf-8');

        resumeExtractedData = await extractResumeData(
          resumeTextContent,
          resumeFile.fileName || 'Curriculo.pdf'
        );
      }

      const updatedCandidate: Candidate = {
        id: candidateId,
        name: personalData.name || candidate?.name || 'Candidato',
        cpf: cleanCpfVal,
        birthDate: personalData.birthDate || candidate?.birthDate || '',
        email: personalData.email || candidate?.email || '',
        phone: personalData.phone || candidate?.phone || '',
        city: personalData.city || candidate?.city || '',
        state: personalData.state || candidate?.state || '',
        linkedin: personalData.linkedin || candidate?.linkedin,
        secondaryPhone: personalData.secondaryPhone || candidate?.secondaryPhone,
        availability: personalData.availability || candidate?.availability,
        salaryExpectation: personalData.salaryExpectation || candidate?.salaryExpectation,
        currentRole: personalData.currentRole || candidate?.currentRole,
        resumeUrl: resumeFile?.fileContent || candidate?.resumeUrl || '',
        resumeFileName: resumeFile?.fileName || candidate?.resumeFileName || 'Curriculo.pdf',
        resumeFileType: resumeFile?.mimeType || candidate?.resumeFileType || 'application/pdf',
        resumeFileSize: resumeFile?.fileSize || candidate?.resumeFileSize || 0,
        resumeUploadedAt: new Date().toISOString(),
        resumeExtractedData: resumeExtractedData || candidate?.resumeExtractedData,
        bancoTalentos: Boolean(bancoTalentos) || Boolean(candidate?.bancoTalentos),
        bancoTalentosConsentAt: bancoTalentos ? new Date().toISOString() : candidate?.bancoTalentosConsentAt,
        createdAt: candidate ? candidate.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.saveCandidate(updatedCandidate);

      // 5. Save Documents
      const applicationId = `APP-${Date.now()}`;
      if (Array.isArray(documents)) {
        for (const doc of documents) {
          if (doc.fileContent) {
            const docObj: CandidateDocument = {
              id: `DOC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              candidateId,
              applicationId,
              category: doc.category || 'profissionais',
              docType: doc.docType || 'Documento',
              title: doc.title || doc.docType || 'Documento Anexo',
              description: doc.description || '',
              fileUrl: doc.fileContent,
              fileName: doc.fileName || 'Anexo.pdf',
              mimeType: doc.mimeType || 'application/pdf',
              fileSize: doc.fileSize || 0,
              isProfileDoc: false,
              uploadedAt: new Date().toISOString()
            };
            db.saveDocument(docObj);
          }
        }
      }

      // 6. Check Eliminatory Questions
      let eliminatoryFailed = false;
      const failedQuestions: string[] = [];
      const answersMap: Record<string, any> = questionAnswers || {};

      if (Array.isArray(job.customQuestions)) {
        for (const q of job.customQuestions) {
          if (q.isEliminatory && q.expectedAnswer) {
            const candidateAns = answersMap[q.id];
            if (
              candidateAns === undefined ||
              String(candidateAns).trim().toLowerCase() !== String(q.expectedAnswer).trim().toLowerCase()
            ) {
              eliminatoryFailed = true;
              failedQuestions.push(q.question);
            }
          }
        }
      }

      // 7. Calculate AI Fit Score
      const aiFit = await calculateAIFitScore(updatedCandidate, job);

      // 8. Create Application
      const newApp: Application = {
        id: applicationId,
        candidateId,
        jobId,
        companyId: job.companyId,
        status: 'ativa',
        stage: 'novo_candidato',
        origin: 'portal_rl_connect',
        answers: answersMap,
        eliminatoryFailed,
        failedQuestions,
        bancoTalentos: Boolean(bancoTalentos),
        lgpdAceito: Boolean(lgpdAccepted),
        lgpdAceitoEm: new Date().toISOString(),
        lgpdPolicyVersion: 'v1.0-2026',
        aiScore: aiFit.score,
        aiSummary: aiFit.summary,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.saveApplication(newApp);

      // Timeline Log
      db.addTimelineEvent({
        id: `TL-${Date.now()}`,
        applicationId,
        title: 'Candidatura Enviada',
        description: `Candidatura submetida via Portal RL RH Connect. ${
          eliminatoryFailed ? 'Atenção: Não atendeu a pergunta eliminatória da vaga.' : 'Todos os requisitos básicos atendidos.'
        }`,
        author: updatedCandidate.name,
        timestamp: new Date().toISOString()
      });

      return res.json({
        success: true,
        applicationId,
        candidateId,
        message: 'Candidatura enviada com sucesso!'
      });
    } catch (e: any) {
      console.error('Error applying:', e);
      res.status(500).json({ error: e.message || 'Erro ao processar candidatura.' });
    }
  });

  // BANCO DE TALENTOS ENDPOINT
  app.post('/api/public/talent-bank', async (req, res) => {
    try {
      const { personalData, resumeFile, lgpdAccepted } = req.body;

      if (!personalData || !personalData.cpf) {
        return res.status(400).json({ error: 'Dados pessoais são obrigatórios.' });
      }

      if (!isValidCPF(personalData.cpf)) {
        return res.status(400).json({ error: 'CPF informado é inválido.' });
      }

      const cleanCpfVal = cleanCPF(personalData.cpf);
      let candidate = db.findCandidateByCpf(cleanCpfVal);
      const candidateId = candidate ? candidate.id : `CAN-${Date.now()}`;

      let resumeExtractedData = candidate?.resumeExtractedData;
      if (resumeFile && resumeFile.fileContent) {
        const resumeTextContent =
          resumeFile.textContent ||
          Buffer.from(
            resumeFile.fileContent.replace(/^data:[^;]+;base64,/, ''),
            'base64'
          ).toString('utf-8');

        resumeExtractedData = await extractResumeData(
          resumeTextContent,
          resumeFile.fileName || 'Curriculo.pdf'
        );
      }

      const updatedCandidate: Candidate = {
        id: candidateId,
        name: personalData.name || candidate?.name || 'Candidato',
        cpf: cleanCpfVal,
        birthDate: personalData.birthDate || candidate?.birthDate || '',
        email: personalData.email || candidate?.email || '',
        phone: personalData.phone || candidate?.phone || '',
        city: personalData.city || candidate?.city || '',
        state: personalData.state || candidate?.state || '',
        linkedin: personalData.linkedin || candidate?.linkedin,
        resumeUrl: resumeFile?.fileContent || candidate?.resumeUrl || '',
        resumeFileName: resumeFile?.fileName || candidate?.resumeFileName || 'Curriculo.pdf',
        resumeFileType: resumeFile?.mimeType || candidate?.resumeFileType || 'application/pdf',
        resumeFileSize: resumeFile?.fileSize || candidate?.resumeFileSize || 0,
        resumeUploadedAt: new Date().toISOString(),
        resumeExtractedData: resumeExtractedData || candidate?.resumeExtractedData,
        bancoTalentos: true,
        bancoTalentosConsentAt: new Date().toISOString(),
        createdAt: candidate ? candidate.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.saveCandidate(updatedCandidate);

      res.json({
        success: true,
        candidateId,
        message: 'Seu perfil foi registrado no Banco de Talentos com sucesso!'
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Erro ao registrar no Banco de Talentos.' });
    }
  });

  // 2. AUTH & COMPANY RECRUITMENT ENDPOINTS

  app.post('/api/auth/login', (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'E-mail é obrigatório.' });
    }

    const user = db.authenticateUser(email);
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado no RL RH Connect.' });
    }

    const company = user.companyId === 'master' ? null : db.getCompanyById(user.companyId);

    res.json({
      user,
      company
    });
  });

  // COMPANY JOBS CRUD
  app.get('/api/company/jobs', (req, res) => {
    const { companyId } = req.query;
    if (!companyId || typeof companyId !== 'string') {
      return res.status(400).json({ error: 'companyId é obrigatório' });
    }

    const jobs = db.getJobs(false, companyId);
    res.json({ jobs });
  });

  app.post('/api/company/jobs', (req, res) => {
    const { jobData, companyId } = req.body;
    if (!jobData || !companyId) {
      return res.status(400).json({ error: 'Dados da vaga incompletos.' });
    }

    const company = db.getCompanyById(companyId);

    const newJob: Job = {
      id: jobData.id || `job-${Date.now()}`,
      companyId: companyId,
      companyName: company ? company.name : 'Empresa',
      companyLogo: company?.logoUrl,
      title: jobData.title || 'Nova Vaga',
      area: jobData.area || 'Administrativo',
      city: jobData.city || 'São Paulo',
      state: jobData.state || 'SP',
      workMode: jobData.workMode || 'Presencial',
      contractType: jobData.contractType || 'CLT',
      salaryMin: jobData.salaryMin,
      salaryMax: jobData.salaryMax,
      salaryDisclosed: Boolean(jobData.salaryDisclosed),
      openingsCount: jobData.openingsCount || 1,
      description: jobData.description || '',
      responsibilities: jobData.responsibilities || [],
      requirements: jobData.requirements || [],
      differentials: jobData.differentials || [],
      benefits: jobData.benefits || [],
      schedule: jobData.schedule || '',
      locationDetails: jobData.locationDetails || '',
      experienceLevel: jobData.experienceLevel || 'Pleno',
      educationLevel: jobData.educationLevel || 'Ensino Médio',
      status: jobData.status || 'aberta',
      published: jobData.published !== undefined ? jobData.published : true,
      publishedAt: jobData.publishedAt || new Date().toISOString(),
      documentRequirements: jobData.documentRequirements || [],
      customQuestions: jobData.customQuestions || [],
      createdAt: jobData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const saved = db.saveJob(newJob);
    res.json({ job: saved });
  });

  app.delete('/api/company/jobs/:id', (req, res) => {
    const { id } = req.params;
    const { companyId } = req.query;
    if (!companyId || typeof companyId !== 'string') {
      return res.status(400).json({ error: 'companyId é obrigatório' });
    }

    const deleted = db.deleteJob(id, companyId);
    if (!deleted) {
      return res.status(404).json({ error: 'Vaga não encontrada ou sem permissão.' });
    }
    res.json({ success: true });
  });

  // COMPANY APPLICATIONS FOR JOB (COLUMNS / TABLE LIST VIEW)
  app.get('/api/company/jobs/:jobId/applications', (req, res) => {
    const { jobId } = req.params;
    const { companyId } = req.query;

    if (!companyId || typeof companyId !== 'string') {
      return res.status(400).json({ error: 'companyId é obrigatório' });
    }

    const applications = db.getApplicationsByJob(jobId, companyId);
    
    // Map with rich candidate data and documents
    const enriched = applications.map(app => {
      const candidate = db.findCandidateById(app.candidateId);
      const docs = db.getCandidateDocuments(app.candidateId, companyId);
      return {
        ...app,
        candidate,
        documentsCount: docs.length
      };
    });

    res.json({ applications: enriched });
  });

  // COMPANY CANDIDATE SIDE DRAWER DATA
  app.get('/api/company/applications/:id', (req, res) => {
    const { id } = req.params;
    const { companyId } = req.query;

    if (!companyId || typeof companyId !== 'string') {
      return res.status(400).json({ error: 'companyId é obrigatório' });
    }

    const app = db.getApplicationById(id);
    if (!app) {
      return res.status(404).json({ error: 'Candidatura não encontrada.' });
    }

    // Security check multi-company isolation
    if (companyId !== 'master' && app.companyId !== companyId) {
      return res.status(403).json({ error: 'Acesso negado para este registro de outra empresa.' });
    }

    const candidate = db.findCandidateById(app.candidateId);
    const job = db.getJobById(app.jobId);
    const documents = db.getCandidateDocuments(app.candidateId, companyId);
    const interviews = db.getInterviews(companyId).filter(i => i.applicationId === app.id);
    const notes = db.getNotes(app.id);
    const timeline = db.getTimeline(app.id);

    res.json({
      application: app,
      candidate,
      job,
      documents,
      interviews,
      notes,
      timeline
    });
  });

  // UPDATE APPLICATION STAGE
  app.patch('/api/company/applications/:id/stage', (req, res) => {
    const { id } = req.params;
    const { stage, rhRating, rhNotes, companyId, authorName } = req.body;

    const app = db.getApplicationById(id);
    if (!app) {
      return res.status(404).json({ error: 'Candidatura não encontrada.' });
    }

    if (companyId !== 'master' && app.companyId !== companyId) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    const oldStage = app.stage;
    app.stage = stage || app.stage;
    if (rhRating !== undefined) app.rhRating = rhRating;
    if (rhNotes !== undefined) app.rhNotes = rhNotes;
    app.updatedAt = new Date().toISOString();

    db.saveApplication(app);

    if (oldStage !== app.stage) {
      db.addTimelineEvent({
        id: `TL-${Date.now()}`,
        applicationId: app.id,
        title: 'Etapa Alterada',
        description: `Etapa alterada de "${oldStage}" para "${app.stage}".`,
        author: authorName || 'Recrutador',
        timestamp: new Date().toISOString()
      });
    }

    res.json({ application: app });
  });

  // ADD INTERNAL NOTE
  app.post('/api/company/applications/:id/notes', (req, res) => {
    const { id } = req.params;
    const { text, author } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Texto da nota é obrigatório.' });
    }

    const note = db.addNote({
      id: `NOTE-${Date.now()}`,
      applicationId: id,
      author: author || 'Recrutador',
      text,
      createdAt: new Date().toISOString()
    });

    db.addTimelineEvent({
      id: `TL-${Date.now()}`,
      applicationId: id,
      title: 'Anotação Interna Adicionada',
      description: text,
      author: author || 'Recrutador',
      timestamp: new Date().toISOString()
    });

    res.json({ note });
  });

  // SCHEDULE INTERVIEW
  app.post('/api/company/applications/:id/interviews', (req, res) => {
    const { id } = req.params;
    const { date, time, responsible, type, link, notes } = req.body;

    const app = db.getApplicationById(id);
    if (!app) {
      return res.status(404).json({ error: 'Candidatura não encontrada.' });
    }

    const interview = db.saveInterview({
      id: `INT-${Date.now()}`,
      applicationId: id,
      candidateId: app.candidateId,
      jobId: app.jobId,
      companyId: app.companyId,
      date,
      time,
      responsible,
      type,
      link,
      notes,
      status: 'agendada',
      createdAt: new Date().toISOString()
    });

    db.addTimelineEvent({
      id: `TL-${Date.now()}`,
      applicationId: id,
      title: 'Entrevista Agendada',
      description: `Entrevista ${type} agendada para ${date} às ${time} com ${responsible}.`,
      author: responsible || 'Recrutador',
      timestamp: new Date().toISOString()
    });

    res.json({ interview });
  });

  // TALENT BANK SEARCH FOR COMPANY
  app.get('/api/company/talent-bank', (req, res) => {
    const { search } = req.query;
    let candidates = db.getTalentBankCandidates();

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.toLowerCase().trim();
      candidates = candidates.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.currentRole?.toLowerCase().includes(q) ||
          c.skills?.some(s => s.toLowerCase().includes(q))
      );
    }

    res.json({ candidates });
  });

  // 3. MASTER PORTAL SETTINGS
  app.post('/api/master/settings', (req, res) => {
    const { settings } = req.body;
    if (!settings) {
      return res.status(400).json({ error: 'Configurações ausentes.' });
    }

    const updated = db.updatePortalSettings(settings);
    res.json({ settings: updated });
  });

  // VITE MIDDLEWARE FOR DEVELOPMENT OR STATIC SERVING IN PROD
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RL RH Connect server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
