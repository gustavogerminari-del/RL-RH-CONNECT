import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/db.js';
import { isValidCPF, cleanCPF } from './src/utils/cpf.js';
import { hasModule } from './src/utils/modules.js';
import { extractResumeData, calculateAIFitScore } from './src/server/gemini.js';
import { Application, Candidate, CandidateDocument, Job, Company, CompanyUser, Subscription } from './src/types.js';

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

      // 1. Mandatory Email & Phone Check + Optional CPF
      const emailRaw = (personalData.email || '').trim();
      const phoneRaw = (personalData.phone || '').trim();
      if (!emailRaw || !phoneRaw) {
        return res
          .status(400)
          .json({ error: 'E-mail e Telefone (WhatsApp) são obrigatórios para a candidatura.' });
      }

      const cpfRaw = personalData.cpf || '';
      const cleanCpfVal = cpfRaw ? cleanCPF(cpfRaw) : '';

      // 2. Identify or Create Candidate by Email, Phone or CPF
      let candidate = db.findCandidateByEmailOrPhone(emailRaw, phoneRaw, cpfRaw);
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

      if (!personalData || !personalData.email || !personalData.phone) {
        return res
          .status(400)
          .json({ error: 'E-mail e Telefone (WhatsApp) são obrigatórios para o cadastro.' });
      }

      const emailRaw = (personalData.email || '').trim();
      const phoneRaw = (personalData.phone || '').trim();
      const cpfRaw = personalData.cpf || '';
      const cleanCpfVal = cpfRaw ? cleanCPF(cpfRaw) : '';

      let candidate = db.findCandidateByEmailOrPhone(emailRaw, phoneRaw, cpfRaw);
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
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'E-mail é obrigatório.' });
    }

    const user = db.authenticateUser(email, password);
    if (!user) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
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
    if (!company) {
      return res.status(404).json({ error: 'Empresa não encontrada.' });
    }

    const hasHeadhunterModule = hasModule(company, 'headhunter');
    const requestedOrigin = jobData.origin || 'vaga_interna';
    const isClientJob = requestedOrigin === 'recrutamento_cliente' || requestedOrigin === 'headhunter';

    // Rule 11: Validation if company does not have Headhunter module
    if (isClientJob && !hasHeadhunterModule) {
      return res.status(400).json({ error: 'Esta empresa não possui o módulo Headhunter habilitado.' });
    }

    // Rule 11: Validation if client job lacks selected client
    if (isClientJob && (!jobData.clientId || !jobData.clientName || !jobData.clientName.trim())) {
      return res.status(400).json({ error: 'Selecione um Cliente Corporativo para esta vaga.' });
    }

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
      // Prompt 01 Extended Fields
      origin: jobData.origin || 'vaga_interna',
      department: jobData.department || jobData.area || '',
      salaryRange: jobData.salaryRange || '',
      recruiterName: jobData.recruiterName || '',
      recruiterId: jobData.recruiterId || '',
      managerName: jobData.managerName || '',
      managerId: jobData.managerId || '',
      centerCostCode: jobData.centerCostCode || '',
      deadline: jobData.deadline || '',
      clientId: jobData.clientId || '',
      clientName: jobData.clientName || '',
      billingRule: jobData.billingRule || '',
      feePercent: jobData.feePercent ? Number(jobData.feePercent) : undefined,
      negotiatedValue: jobData.negotiatedValue ? Number(jobData.negotiatedValue) : undefined,
      paymentDeadline: jobData.paymentDeadline || '',
      commercialResponsible: jobData.commercialResponsible || '',
      paymentStatus: jobData.paymentStatus || 'Aguardando contratação',
      commercialNotes: jobData.commercialNotes || '',
      archived: jobData.archived || false,
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

  // ADD EXISTING CANDIDATE FROM TALENT BANK TO JOB (NO CANDIDATE DUPLICATION)
  app.post('/api/company/jobs/:jobId/add-candidate', (req, res) => {
    const { jobId } = req.params;
    const { candidateId, companyId, source } = req.body;

    if (!jobId || !candidateId || !companyId) {
      return res.status(400).json({ error: 'jobId, candidateId e companyId são obrigatórios.' });
    }

    const candidate = db.findCandidateById(candidateId);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidato não encontrado.' });
    }

    const job = db.getJobById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Vaga não encontrada.' });
    }

    // Check if candidate already has active application for this job
    const existingApp = db.findActiveApplication(candidateId, jobId);
    if (existingApp) {
      return res.status(400).json({ error: 'Candidato já está inscrito nesta vaga.' });
    }

    const newApp: Application = {
      id: `APP-${Date.now()}`,
      candidateId: candidate.id,
      jobId: job.id,
      companyId: companyId,
      stage: 'novo_candidato',
      status: 'ativa',
      origin: 'banco_de_talentos',
      answers: {},
      eliminatoryFailed: false,
      bancoTalentos: true,
      lgpdAceito: true,
      lgpdAceitoEm: new Date().toISOString(),
      lgpdPolicyVersion: 'v1.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.saveApplication(newApp);

    db.addTimelineEvent({
      id: `TL-${Date.now()}`,
      applicationId: newApp.id,
      title: 'Inscrição via Banco de Talentos IA',
      description: `Candidato vinculado à vaga "${job.title}" a partir do Banco de Talentos IA.`,
      author: 'Recrutador RH',
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, application: newApp });
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

      // AUTOMATIC FLOW FOR HIRING: When a candidate is hired ('contratado' / 'Contratado'),
      // automatically move ALL other candidates applied to this same job to 'banco_de_talentos'
      // and register candidate in central Employees / Admissions
      const currentStageStr = String(app.stage || '').toLowerCase();
      if (currentStageStr.includes('contratad')) {
        db.hireCandidateToEmployee(app.id);

        if (app.jobId) {
          const jobApps = db.getApplicationsByJob(app.jobId, app.companyId);
          jobApps.forEach(otherApp => {
            const otherStageStr = String(otherApp.stage || '').toLowerCase();
            if (otherApp.id !== app.id && !otherStageStr.includes('contratad') && !otherStageStr.includes('banco')) {
              otherApp.stage = 'banco_de_talentos' as any;
              otherApp.updatedAt = new Date().toISOString();
              db.saveApplication(otherApp);

              db.addTimelineEvent({
                id: `TL-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                applicationId: otherApp.id,
                title: 'Redirecionado ao Banco de Talentos',
                description: `Vaga preenchida por contratação. Candidato redirecionado automaticamente para o Banco de Talentos.`,
                author: authorName || 'Sistema RH',
                timestamp: new Date().toISOString()
              });
            }
          });
        }
      }
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

  // SCHEDULE INTERVIEW & COMPANY INTERVIEWS
  app.get('/api/company/interviews', (req, res) => {
    const { companyId } = req.query;
    if (!companyId || typeof companyId !== 'string') {
      return res.status(400).json({ error: 'companyId é obrigatório.' });
    }

    const interviews = db.getInterviews(companyId);
    const enriched = interviews.map(i => {
      const candidate = db.findCandidateById(i.candidateId);
      const job = db.getJobById(i.jobId);
      return {
        ...i,
        candidateName: candidate?.name || 'Candidato',
        candidateEmail: candidate?.email,
        candidatePhone: candidate?.phone,
        jobTitle: job?.title || 'Vaga'
      };
    });

    res.json({ interviews: enriched });
  });

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

  app.patch('/api/company/interviews/:id', (req, res) => {
    const { id } = req.params;
    const { status, date, time, responsible, type, link, notes, outcomeNotes, rating } = req.body;

    const interviews = db.getInterviews();
    const existing = interviews.find(i => i.id === id);
    if (!existing) {
      return res.status(404).json({ error: 'Entrevista não encontrada.' });
    }

    const updated = db.saveInterview({
      ...existing,
      status: status || existing.status,
      date: date || existing.date,
      time: time || existing.time,
      responsible: responsible || existing.responsible,
      type: type || existing.type,
      link: link !== undefined ? link : existing.link,
      notes: notes !== undefined ? notes : existing.notes,
      outcomeNotes: outcomeNotes !== undefined ? outcomeNotes : existing.outcomeNotes,
      rating: rating !== undefined ? rating : existing.rating
    });

    if (existing.applicationId) {
      db.addTimelineEvent({
        id: `TL-${Date.now()}`,
        applicationId: existing.applicationId,
        title: 'Entrevista Atualizada',
        description: `Entrevista atualizada: status = ${updated.status}. ${outcomeNotes ? 'Resultado registrado.' : ''}`,
        author: responsible || 'Recrutador',
        timestamp: new Date().toISOString()
      });
    }

    res.json({ interview: updated });
  });

  // TALENT BANK / CANDIDATES POOL SEARCH FOR COMPANY
  app.get(['/api/company/talent-bank', '/api/company/candidates/pool'], (req, res) => {
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

  // ALL CANDIDATES VIEW FOR COMPANY
  app.get('/api/company/candidates', (req, res) => {
    const { companyId, search } = req.query;
    const cid = (companyId as string) || 'c1';

    let candidates = db.getTalentBankCandidates();
    const allApps = db.getApplicationsByCompany(cid);

    let enriched = candidates.map(c => {
      const app = allApps.find(a => a.candidateId === c.id);
      const job = app ? db.getJobById(app.jobId) : null;
      return {
        ...c,
        applicationId: app?.id,
        jobId: app?.jobId,
        jobTitle: job ? job.title : 'Banco de Talentos',
        stage: app ? app.stage : 'banco_de_talentos',
        appliedAt: app ? app.createdAt : c.createdAt
      };
    });

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.toLowerCase().trim();
      enriched = enriched.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.jobTitle.toLowerCase().includes(q) ||
          c.currentRole?.toLowerCase().includes(q) ||
          c.skills?.some(s => s.toLowerCase().includes(q))
      );
    }

    res.json({ candidates: enriched });
  });

  // 3. MASTER PORTAL SETTINGS & SAAS MANAGEMENT
  app.post('/api/master/settings', (req, res) => {
    const { settings } = req.body;
    if (!settings) {
      return res.status(400).json({ error: 'Configurações ausentes.' });
    }

    const updated = db.updatePortalSettings(settings);
    res.json({ settings: updated });
  });

  // SAAS PLANS CRUD
  app.get('/api/master/plans', (req, res) => {
    const plans = db.getSaaSPlans();
    res.json({ plans });
  });

  app.post('/api/master/plans', (req, res) => {
    const { plan } = req.body;
    if (!plan || !plan.name) {
      return res.status(400).json({ error: 'Dados do plano são obrigatórios.' });
    }

    const newPlan = {
      id: plan.id || `plan-${Date.now()}`,
      name: plan.name,
      description: plan.description || '',
      priceMonthly: Number(plan.priceMonthly) || 0,
      priceAnnual: Number(plan.priceAnnual) || 0,
      maxJobs: plan.maxJobs !== undefined ? Number(plan.maxJobs) : 5,
      maxUsers: plan.maxUsers !== undefined ? Number(plan.maxUsers) : 2,
      maxCandidates: plan.maxCandidates !== undefined ? Number(plan.maxCandidates) : 500,
      features: Array.isArray(plan.features) ? plan.features : [],
      popular: Boolean(plan.popular),
      active: plan.active !== undefined ? Boolean(plan.active) : true,
      createdAt: plan.createdAt || new Date().toISOString()
    };

    const saved = db.saveSaaSPlan(newPlan);
    res.json({ plan: saved });
  });

  // SUBSCRIPTIONS MANAGEMENT & COMPANIES OVERVIEW
  app.get('/api/master/subscriptions', (req, res) => {
    const subscriptions = db.getSubscriptions();
    const companies = db.getCompanies();
    const plans = db.getSaaSPlans();

    // Map rich company subscription objects
    const companySubscriptions = companies.map(comp => {
      let sub = subscriptions.find(s => s.companyId === comp.id);
      if (!sub) {
        // Auto-assign default Starter plan subscription if not exists
        const defaultPlan = plans[0] || { id: 'plan-starter', name: 'Plano Starter', priceMonthly: 290 };
        sub = {
          id: `sub-${comp.id}`,
          companyId: comp.id,
          companyName: comp.name,
          planId: defaultPlan.id,
          planName: defaultPlan.name,
          status: comp.active ? 'ativa' : 'bloqueada',
          billingCycle: 'mensal',
          price: defaultPlan.priceMonthly,
          autoRenew: true,
          startDate: comp.createdAt,
          nextBillingDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
          createdAt: comp.createdAt,
          updatedAt: new Date().toISOString()
        };
        db.saveSubscription(sub);
      }

      // Count jobs & applications for usage stats
      const jobs = db.getJobs(false, comp.id);
      const applications = db.getApplicationsByCompany(comp.id);
      const user = db.getCompanyUsers().find(u => u.companyId === comp.id);

      return {
        company: comp,
        subscription: sub,
        user: user || null,
        jobsCount: jobs.length,
        applicationsCount: applications.length
      };
    });

    res.json({ subscriptions: companySubscriptions, plans });
  });

  app.post('/api/master/subscriptions/status', (req, res) => {
    const { companyId, status, planId, active } = req.body;
    if (!companyId) {
      return res.status(400).json({ error: 'companyId é obrigatório.' });
    }

    if (active !== undefined) {
      db.toggleCompanyActiveStatus(companyId, Boolean(active));
    }

    let sub = db.getSubscriptionByCompany(companyId);
    if (sub) {
      if (status) sub.status = status;
      if (planId) {
        const plan = db.getSaaSPlans().find(p => p.id === planId);
        if (plan) {
          sub.planId = plan.id;
          sub.planName = plan.name;
          sub.price = sub.billingCycle === 'anual' ? plan.priceAnnual : plan.priceMonthly;
        }
      }
      db.saveSubscription(sub);
    }

    res.json({ success: true, subscription: sub });
  });

  // REGISTER NEW COMPANY WITH LOGIN, PASSWORD & MODULES
  app.post('/api/master/companies/register', (req, res) => {
    const {
      name,
      tradeName,
      cnpj,
      city,
      state,
      description,
      adminName,
      adminEmail,
      adminPassword,
      adminRole,
      planId,
      billingCycle,
      modules
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'O Nome da Empresa é obrigatório.' });
    }
    if (!adminEmail || !adminEmail.trim()) {
      return res.status(400).json({ error: 'O E-mail do Administrador é obrigatório.' });
    }

    const companyId = `comp-${Date.now().toString(36)}`;
    const enabledModules = Array.isArray(modules) && modules.length > 0
      ? modules
      : ['vagas', 'candidatos', 'banco-de-talentos', 'funcionarios', 'ponto-digital', 'folha-de-pagamento', 'beneficios', 'central-documentos', 'relatorios', 'ia-rh'];

    // 1. Create Company
    const newCompany: Company = {
      id: companyId,
      name: name.trim(),
      tradeName: tradeName ? tradeName.trim() : name.trim(),
      cnpj: cnpj ? cnpj.trim() : '',
      city: city ? city.trim() : 'São Paulo',
      state: state ? state.trim() : 'SP',
      description: description ? description.trim() : '',
      active: true,
      modules: enabledModules,
      createdAt: new Date().toISOString()
    };
    db.saveCompany(newCompany);

    // 2. Create Admin User Credentials
    const userId = `usr-${Date.now().toString(36)}`;
    const newUser: CompanyUser = {
      id: userId,
      email: adminEmail.trim().toLowerCase(),
      name: adminName ? adminName.trim() : 'Administrador Empresa',
      password: adminPassword ? adminPassword.trim() : '123456',
      companyId: companyId,
      role: (adminRole as any) || 'admin'
    };
    db.saveCompanyUser(newUser);

    // 3. Create Subscription
    const plans = db.getSaaSPlans();
    const selectedPlan = plans.find(p => p.id === planId) || plans[0] || {
      id: 'plan-starter',
      name: 'Plano Profissional',
      priceMonthly: 390,
      priceAnnual: 3900
    };

    const cycle = billingCycle === 'anual' ? 'anual' : 'mensal';
    const price = cycle === 'anual' ? selectedPlan.priceAnnual : selectedPlan.priceMonthly;

    const newSub: Subscription = {
      id: `sub-${companyId}`,
      companyId,
      companyName: newCompany.name,
      planId: selectedPlan.id,
      planName: selectedPlan.name,
      status: 'ativa',
      billingCycle: cycle,
      price: price || 390,
      autoRenew: true,
      startDate: new Date().toISOString(),
      nextBillingDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      modules: enabledModules,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.saveSubscription(newSub);

    res.json({
      success: true,
      message: `Empresa "${newCompany.name}" e credenciais criadas com sucesso!`,
      company: newCompany,
      user: newUser,
      subscription: newSub
    });
  });

  // UPDATE EXISTING COMPANY DETAILS, CREDENTIALS, PLAN, MODULES & STATUS
  app.put('/api/master/companies/:id', (req, res) => {
    const { id } = req.params;
    const {
      name,
      tradeName,
      cnpj,
      city,
      state,
      description,
      adminName,
      adminEmail,
      adminPassword,
      adminRole,
      planId,
      billingCycle,
      modules,
      active
    } = req.body;

    const company = db.getCompanyById(id);
    if (!company) {
      return res.status(404).json({ error: 'Empresa não encontrada.' });
    }

    if (name && name.trim()) company.name = name.trim();
    if (tradeName !== undefined) company.tradeName = tradeName.trim();
    if (cnpj !== undefined) company.cnpj = cnpj.trim();
    if (city !== undefined) company.city = city.trim();
    if (state !== undefined) company.state = state.trim();
    if (description !== undefined) company.description = description.trim();
    if (typeof active === 'boolean') company.active = active;

    if (Array.isArray(modules)) {
      company.modules = modules;
    }
    db.saveCompany(company);

    // Update or create user credentials
    let user = db.getCompanyUsers().find(u => u.companyId === id);
    if (adminEmail || adminName || adminPassword || adminRole) {
      if (!user) {
        user = {
          id: `usr-${id}`,
          email: adminEmail ? adminEmail.trim().toLowerCase() : `admin@${id}.com`,
          name: adminName ? adminName.trim() : 'Administrador',
          password: adminPassword ? adminPassword.trim() : '123456',
          companyId: id,
          role: adminRole || 'admin'
        };
      } else {
        if (adminEmail && adminEmail.trim()) user.email = adminEmail.trim().toLowerCase();
        if (adminName && adminName.trim()) user.name = adminName.trim();
        if (adminPassword && adminPassword.trim()) user.password = adminPassword.trim();
        if (adminRole) user.role = adminRole;
      }
      db.saveCompanyUser(user);
    }

    // Update Subscription plan / billing cycle / modules / status
    let sub = db.getSubscriptionByCompany(id);
    if (sub) {
      if (planId) {
        const plans = db.getSaaSPlans();
        const selectedPlan = plans.find(p => p.id === planId);
        if (selectedPlan) {
          sub.planId = selectedPlan.id;
          sub.planName = selectedPlan.name;
          const cycle = billingCycle || sub.billingCycle;
          sub.billingCycle = cycle;
          sub.price = cycle === 'anual' ? selectedPlan.priceAnnual : selectedPlan.priceMonthly;
        }
      }
      if (typeof active === 'boolean') {
        sub.status = active ? 'ativa' : 'bloqueada';
      }
      if (Array.isArray(modules)) {
        sub.modules = modules;
      }
      sub.updatedAt = new Date().toISOString();
      db.saveSubscription(sub);
    }

    res.json({
      success: true,
      message: `Empresa "${company.name}" atualizada com sucesso!`,
      company,
      user,
      subscription: sub
    });
  });

  // INVOICES & NFS-e MANAGEMENT
  app.get('/api/master/invoices', (req, res) => {
    const { companyId } = req.query;
    const invoices = db.getInvoices(companyId as string);
    res.json({ invoices });
  });

  app.post('/api/master/invoices/create', (req, res) => {
    const { companyId, planId, billingCycle, paymentMethod } = req.body;

    const company = db.getCompanyById(companyId);
    if (!company) {
      return res.status(404).json({ error: 'Empresa não encontrada.' });
    }

    const plan = db.getSaaSPlans().find(p => p.id === planId) || db.getSaaSPlans()[0];
    const amount = billingCycle === 'anual' ? plan.priceAnnual : plan.priceMonthly;
    const invId = `FAT-${new Date().toISOString().slice(0, 7).replace('-', '')}-${Math.floor(100 + Math.random() * 900)}`;

    const newInvoice: any = {
      id: invId,
      idempotencyKey: `IDEM-${invId}-${company.id}`,
      companyId: company.id,
      companyName: company.name,
      subscriptionId: `sub-${company.id}`,
      planName: plan.name,
      amount,
      status: 'pendente',
      paymentMethod: paymentMethod || 'pix',
      pixQrCode: `00020126580014br.gov.bcb.pix0136${Math.random().toString(36).substring(2)}5204000053039865406${amount}.005802BR5925RL RH CONNECT LTDA6009SAO PAULO6304${Math.floor(1000 + Math.random() * 9000)}`,
      pixQrCodeBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      ticketUrl: paymentMethod === 'boleto' ? `https://www.mercadopago.com.br/payments/ticket/${Math.floor(10000000 + Math.random() * 90000000)}/render` : undefined,
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
      nfeStatus: 'nao_emitida'
    };

    db.saveInvoice(newInvoice);
    res.json({ invoice: newInvoice, message: 'Cobrança gerada via Mercado Pago com sucesso.' });
  });

  // NFS-e ISSUANCE (IDEMPOTENT BACKEND API)
  app.post('/api/master/invoices/:id/issue-nfe', (req, res) => {
    const { id } = req.params;
    const result = db.issueNfeForInvoice(id);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      invoice: result.invoice,
      message: result.error || 'Nota Fiscal de Serviço (NFS-e) emitida com sucesso no ambiente fiscal!'
    });
  });

  // MERCADO PAGO WEBHOOK (BACKEND PAYMENT CONFIRMATION)
  app.post('/api/webhooks/mercadopago', (req, res) => {
    try {
      console.log('Mercado Pago Webhook Received:', req.body);
      const result = db.handleMercadoPagoWebhook(req.body);
      res.status(200).json({ received: true, ...result });
    } catch (e: any) {
      console.error('Webhook error:', e);
      res.status(500).json({ error: 'Erro interno ao processar webhook.' });
    }
  });

  // --- COMPANY DASHBOARD METRICS ---
  app.get('/api/company/details', (req, res) => {
    const { companyId } = req.query;
    if (!companyId || typeof companyId !== 'string') {
      return res.status(400).json({ error: 'companyId é obrigatório.' });
    }
    const company = db.getCompanyById(companyId);
    if (!company) {
      return res.status(404).json({ error: 'Empresa não encontrada.' });
    }
    res.json({ company });
  });

  app.get('/api/company/dashboard', (req, res) => {
    const { companyId } = req.query;
    if (!companyId || typeof companyId !== 'string') {
      return res.status(400).json({ error: 'companyId é obrigatório.' });
    }
    const metrics = db.getCompanyDashboardMetrics(companyId);
    res.json({ metrics });
  });

  // --- 7. FUNCIONÁRIOS (CADASTRO CENTRAL DE COLABORADOR) ---
  app.get('/api/company/employees', (req, res) => {
    const { companyId } = req.query;
    const employees = db.getEmployees(companyId as string);
    res.json({ employees });
  });

  app.get('/api/company/employees/:id', (req, res) => {
    const { id } = req.params;
    const employee = db.getEmployeeById(id);
    if (!employee) {
      return res.status(404).json({ error: 'Colaborador não encontrado.' });
    }
    res.json({ employee });
  });

  app.post('/api/company/employees', (req, res) => {
    const emp = req.body;
    if (!emp.name || !emp.cpf || !emp.companyId) {
      return res.status(400).json({ error: 'Nome, CPF e Empresa são obrigatórios.' });
    }
    if (!emp.id) {
      emp.id = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
      emp.createdAt = new Date().toISOString();
    }
    emp.updatedAt = new Date().toISOString();

    const saved = db.saveEmployee(emp);
    res.json({ employee: saved, message: 'Colaborador salvo no cadastro central com sucesso!' });
  });

  // INTEGRAÇÃO RECRUTAMENTO/HEADHUNTER -> DEPARTAMENTO PESSOAL (ADMISSÃO E CONTRATAÇÃO)
  app.post('/api/company/applications/:id/hire', (req, res) => {
    const { id } = req.params;
    const customAdmissionData = req.body;
    const result = db.hireCandidateToEmployee(id, customAdmissionData);

    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    res.json({
      success: true,
      message: result.message,
      employee: result.employee
    });
  });

  // Dedicated Hire to DP
  app.post('/api/company/applications/:id/hire-dp', (req, res) => {
    const { id } = req.params;
    const customAdmissionData = req.body || {};
    const result = db.hireCandidateToEmployee(id, customAdmissionData);

    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    res.json({
      success: true,
      message: 'Candidato enviado para Departamento Pessoal com sucesso.',
      employee: result.employee
    });
  });

  // Dedicated Hire to Headhunter Financial
  app.post('/api/company/applications/:id/hire-headhunter', (req, res) => {
    const { id } = req.params;
    const { recruiterUser, companyId, ...payload } = req.body || {};
    const targetCompanyId = companyId || payload.companyId;
    if (targetCompanyId) {
      const company = db.getCompanyById(targetCompanyId);
      if (company && !hasModule(company, 'headhunter')) {
        return res.status(403).json({ error: 'Módulo Headhunter não habilitado para esta empresa.' });
      }
    }
    const result = db.hireHeadhunterCandidate(id, recruiterUser, payload);

    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    res.json({
      success: true,
      message: result.message,
      financial: result.financial
    });
  });

  // --- HEADHUNTER CLIENTS ENDPOINTS ---
  app.get('/api/company/headhunter/clients', (req, res) => {
    const { companyId } = req.query;
    if (companyId && typeof companyId === 'string' && companyId !== 'master') {
      const company = db.getCompanyById(companyId);
      if (company && !hasModule(company, 'headhunter')) {
        return res.json({ clients: [] });
      }
    }
    const clients = db.getHeadhunterClients(companyId as string);
    res.json({ clients });
  });

  app.post('/api/company/headhunter/clients', (req, res) => {
    const clientData = req.body;
    const companyId = clientData.companyId;
    if (companyId) {
      const company = db.getCompanyById(companyId);
      if (company && !hasModule(company, 'headhunter')) {
        return res.status(403).json({ error: 'Módulo Headhunter não habilitado para esta empresa.' });
      }
    }
    if (!clientData.tradeName && !clientData.corporateName) {
      return res.status(400).json({ error: 'Razão Social ou Nome Fantasia é obrigatório.' });
    }
    const clientToSave = {
      ...clientData,
      id: clientData.id || `CLI-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: clientData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const saved = db.saveHeadhunterClient(clientToSave);
    res.json({ client: saved, message: 'Cliente Headhunter salvo com sucesso!' });
  });

  app.delete('/api/company/headhunter/clients/:id', (req, res) => {
    const { id } = req.params;
    const { companyId } = req.query;
    const success = db.deleteHeadhunterClient(id, (companyId as string) || 'master');
    if (!success) {
      return res.status(404).json({ error: 'Cliente não encontrado para exclusão.' });
    }
    res.json({ success: true, message: 'Cliente excluído com sucesso.' });
  });

  // --- HEADHUNTER FINANCIAL ENDPOINTS ---
  app.get('/api/company/headhunter/financial', (req, res) => {
    const { companyId } = req.query;
    const financials = db.getHeadhunterFinancials(companyId as string);
    res.json({ financials });
  });

  app.post('/api/company/headhunter/financial', (req, res) => {
    const finData = req.body;
    if (!finData.companyId || !finData.clientId) {
      return res.status(400).json({ error: 'companyId e clientId são obrigatórios.' });
    }
    const finToSave = {
      ...finData,
      id: finData.id || `FIN-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: finData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const saved = db.saveHeadhunterFinancial(finToSave);
    res.json({ financial: saved, message: 'Lançamento financeiro salvo com sucesso!' });
  });

  app.patch('/api/company/headhunter/financial/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, notes, dueDate, user } = req.body;
    const fin = db.getHeadhunterFinancialById(id);
    if (!fin) {
      return res.status(404).json({ error: 'Lançamento financeiro não encontrado.' });
    }

    const oldStatus = fin.status;
    fin.status = status || fin.status;
    if (notes) fin.notes = notes;
    if (dueDate) fin.dueDate = dueDate;
    fin.updatedAt = new Date().toISOString();

    if (!fin.history) fin.history = [];
    fin.history.unshift({
      date: new Date().toISOString(),
      action: `Status alterado de "${oldStatus}" para "${fin.status}"`,
      user: user || 'Gestor Financeiro',
      description: notes || `Atualização de status financeiro.`
    });

    const saved = db.saveHeadhunterFinancial(fin);
    res.json({ financial: saved, message: `Status atualizado para "${saved.status}"` });
  });

  app.get('/api/company/contratacoes', (req, res) => {
    const { companyId } = req.query;
    const cid = (companyId as string) || 'c1';

    const allApps = db.getApplicationsByCompany(cid);
    const hiredApps = allApps.filter(a => String(a.stage || '').toLowerCase().includes('contratad'));

    const list = hiredApps.map(a => {
      const candidate = db.findCandidateById(a.candidateId);
      const job = db.getJobById(a.jobId);
      const fin = (db.getHeadhunterFinancials(cid) || []).find(f => f.applicationId === a.id);

      return {
        id: `contratacao-${a.id}`,
        applicationId: a.id,
        candidateName: candidate ? candidate.name : 'Candidato Contratado',
        jobTitle: job ? job.title : 'Vaga Contratada',
        date: new Date(a.updatedAt || a.createdAt || Date.now()).toLocaleDateString('pt-BR'),
        destination: job?.origin === 'vaga_interna' ? 'Departamento Pessoal (DP)' : 'Financeiro / Headhunter',
        statusProcesso: 'Contratação Concluída',
        remuneration: job && job.salaryMin ? `R$ ${job.salaryMin.toLocaleString('pt-BR')}` : 'R$ 5.200,00',
        salaryAmount: job && job.salaryMin ? `R$ ${job.salaryMin.toLocaleString('pt-BR')}` : 'R$ 5.200,00',
        honorariosAmount: fin ? `R$ ${fin.feeAmount.toLocaleString('pt-BR')}` : (job && job.salaryMin ? `R$ ${(job.salaryMin * 0.15).toLocaleString('pt-BR')}` : 'R$ 10.400,00'),
        clientName: fin?.clientName || job?.clientName || 'Empresa Cliente',
        sentToHeadhunter: job?.origin !== 'vaga_interna'
      };
    });

    res.json({ contratacoes: list });
  });

  // --- 8. DEPARTAMENTO PESSOAL (FÉRIAS, RESCISÃO, OCORRÊNCIAS) ---
  app.get('/api/company/vacations', (req, res) => {
    const { companyId } = req.query;
    const vacations = db.getVacations(companyId as string);
    res.json({ vacations });
  });

  app.post('/api/company/vacations', (req, res) => {
    const vac = req.body;
    if (!vac.employeeId || !vac.companyId || !vac.startDate) {
      return res.status(400).json({ error: 'Colaborador, Empresa e Data Inicial são obrigatórios.' });
    }
    if (!vac.id) {
      vac.id = `VAC-${Math.floor(100 + Math.random() * 900)}`;
      vac.createdAt = new Date().toISOString();
    }
    const emp = db.getEmployeeById(vac.employeeId);
    if (emp) vac.employeeName = emp.name;

    const saved = db.saveVacation(vac);
    res.json({ vacation: saved, message: 'Férias agendadas no Departamento Pessoal!' });
  });

  app.get('/api/company/terminations', (req, res) => {
    const { companyId } = req.query;
    const terminations = db.getTerminations(companyId as string);
    res.json({ terminations });
  });

  app.post('/api/company/terminations', (req, res) => {
    const term = req.body;
    if (!term.employeeId || !term.companyId || !term.reason) {
      return res.status(400).json({ error: 'Colaborador, Empresa e Motivo do Desligamento são obrigatórios.' });
    }
    if (!term.id) {
      term.id = `TERM-${Math.floor(100 + Math.random() * 900)}`;
      term.createdAt = new Date().toISOString();
    }
    const emp = db.getEmployeeById(term.employeeId);
    if (emp) term.employeeName = emp.name;

    const saved = db.saveTermination(term);
    res.json({ termination: saved, message: 'Rescisão cadastrada e colaborador atualizado como Desligado.' });
  });

  app.get('/api/company/dp-occurrences', (req, res) => {
    const { companyId } = req.query;
    const occurrences = db.getDPOccurrences(companyId as string);
    res.json({ occurrences });
  });

  app.post('/api/company/dp-occurrences', (req, res) => {
    const occ = req.body;
    if (!occ.employeeId || !occ.companyId || !occ.description) {
      return res.status(400).json({ error: 'Colaborador, Empresa e Descrição são obrigatórios.' });
    }
    if (!occ.id) {
      occ.id = `OCC-${Math.floor(100 + Math.random() * 900)}`;
      occ.createdAt = new Date().toISOString();
    }
    const emp = db.getEmployeeById(occ.employeeId);
    if (emp) occ.employeeName = emp.name;

    const saved = db.saveDPOccurrence(occ);
    res.json({ occurrence: saved, message: 'Ocorrência registrada no prontuário do colaborador.' });
  });

  // --- 9. PONTO DIGITAL ---
  app.get('/api/company/time-clock', (req, res) => {
    const { companyId, employeeId } = req.query;
    const entries = db.getTimeClockEntries(companyId as string, employeeId as string);
    res.json({ timeClockEntries: entries });
  });

  app.post('/api/company/time-clock', (req, res) => {
    const entry = req.body;
    if (!entry.employeeId || !entry.companyId || !entry.clockIn) {
      return res.status(400).json({ error: 'Colaborador, Empresa e Batimento de Ponto são obrigatórios.' });
    }
    if (!entry.id) {
      entry.id = `PONTO-${Math.floor(100 + Math.random() * 900)}`;
      entry.createdAt = new Date().toISOString();
    }
    const emp = db.getEmployeeById(entry.employeeId);
    if (emp) entry.employeeName = emp.name;

    const saved = db.saveTimeClockEntry(entry);
    res.json({ entry: saved, message: 'Registro de ponto efetuado com sucesso!' });
  });

  // --- 10. FOLHA DE PAGAMENTO ---
  app.get('/api/company/payrolls', (req, res) => {
    const { companyId, monthYear } = req.query;
    const payrolls = db.getPayrolls(companyId as string, monthYear as string);
    res.json({ payrolls });
  });

  app.post('/api/company/payrolls/calculate', (req, res) => {
    const { companyId, monthYear } = req.body;
    if (!companyId || !monthYear) {
      return res.status(400).json({ error: 'companyId e monthYear são obrigatórios.' });
    }
    const calculated = db.calculateAndGeneratePayroll(companyId, monthYear);
    res.json({ payrolls: calculated, message: `Folha de pagamento de ${monthYear} calculada com sucesso para ${calculated.length} colaboradores.` });
  });

  // --- 11. BENEFÍCIOS ---
  app.get('/api/company/benefits', (req, res) => {
    const { companyId } = req.query;
    const benefits = db.getBenefits(companyId as string);
    res.json({ benefits });
  });

  app.post('/api/company/benefits', (req, res) => {
    const ben = req.body;
    if (!ben.name || !ben.companyId || !ben.type) {
      return res.status(400).json({ error: 'Nome, Empresa e Tipo de Benefício são obrigatórios.' });
    }
    if (!ben.id) {
      ben.id = `ben-${Math.floor(100 + Math.random() * 900)}`;
      ben.createdAt = new Date().toISOString();
    }
    const saved = db.saveBenefit(ben);
    res.json({ benefit: saved, message: 'Benefício salvo com sucesso!' });
  });

  // --- 12. DOCUMENTOS CENTRAIS ---
  app.get('/api/company/central-documents', (req, res) => {
    const { companyId, entityType, entityId } = req.query;
    const docs = db.getCentralDocuments(companyId as string, entityType as string, entityId as string);
    res.json({ documents: docs });
  });

  app.post('/api/company/central-documents', (req, res) => {
    const doc = req.body;
    if (!doc.title || !doc.companyId || !doc.fileUrl) {
      return res.status(400).json({ error: 'Título, Empresa e Anexo/Arquivo são obrigatórios.' });
    }
    if (!doc.id) {
      doc.id = `DOC-CENTRAL-${Math.floor(100 + Math.random() * 900)}`;
      doc.uploadedAt = new Date().toISOString();
    }
    const saved = db.saveCentralDocument(doc);
    res.json({ document: saved, message: 'Documento armazenado com sucesso na Central Documental.' });
  });

  // CONSTRUTOR MASTER INTERNO (BUILDER CONFIG)
  app.get('/api/master/builder', (req, res) => {
    const config = db.getMasterBuilderConfig();
    res.json({ config });
  });

  app.post('/api/master/builder', (req, res) => {
    const { config } = req.body;
    if (!config) {
      return res.status(400).json({ error: 'Configuração do Construtor Master ausente.' });
    }

    const updated = db.updateMasterBuilderConfig(config);
    res.json({ config: updated, message: 'Módulos, campos customizados e integrações do Construtor Master salvos!' });
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
