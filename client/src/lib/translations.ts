export type Language = 'pt' | 'en' | 'es';

export interface Translations {
  // Navigation
  nav: {
    home: string;
    about: string;
    lia: string;
    methodology: string;
    solutions: string;
    cases: string;
    contact: string;
    login: string;
  };
  // Hero Section
  hero: {
    title: string;
    subtitle: string;
    cta1: string;
    cta2: string;
  };
  // About Section
  about: {
    title: string;
    whoWeAre: string;
    whoWeAreText: string;
    mission: string;
    missionText: string;
    objective: string;
    objectiveText: string;
    whyChoose: string;
    reason1Title: string;
    reason1Text: string;
    reason2Title: string;
    reason2Text: string;
    reason3Title: string;
    reason3Text: string;
  };
  // LIA Section
  lia: {
    title: string;
    subtitle: string;
    description: string;
    question1: string;
    question2: string;
    accessButton: string;
  };
  // Four Visions
  visions: {
    title: string;
    subtitle: string;
    descriptive: string;
    descriptiveText: string;
    diagnostic: string;
    diagnosticText: string;
    predictive: string;
    predictiveText: string;
    prescriptive: string;
    prescriptiveText: string;
  };
  // Methodology TAIA
  methodology: {
    title: string;
    subtitle: string;
    phase1: string;
    phase1Title: string;
    phase1Text: string;
    phase2: string;
    phase2Title: string;
    phase2Text: string;
    phase3: string;
    phase3Title: string;
    phase3Text: string;
    phase4: string;
    phase4Title: string;
    phase4Text: string;
    whyWorks: string;
    benefit1Title: string;
    benefit1Text: string;
    benefit2Title: string;
    benefit2Text: string;
    benefit3Title: string;
    benefit3Text: string;
  };
  // Benefits
  benefits: {
    title: string;
    benefit1: string;
    benefit2: string;
    benefit3: string;
    benefit4: string;
  };
  // Cases
  cases: {
    title: string;
    case1Title: string;
    case1Text: string;
    case1Result: string;
    case2Title: string;
    case2Text: string;
    case2Result: string;
  };
  // Process
  process: {
    title: string;
    step1: string;
    step2: string;
    step3: string;
    step4: string;
  };
  // Team
  team: {
    title: string;
    profile1: string;
    profile2: string;
    profile3: string;
  };
  // CTA
  cta: {
    title: string;
    subtitle: string;
    button: string;
  };
  // Contact
  contact: {
    title: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    send: string;
    sending: string;
    success: string;
    error: string;
  };
  // Footer
  footer: {
    about: string;
    contact: string;
    followUs: string;
    rights: string;
  };
  // Login
  login: {
    title: string;
    subtitle: string;
    email: string;
    password: string;
    button: string;
    forgotPassword: string;
    noAccount: string;
  };
}

export const translations: Record<Language, Translations> = {
  pt: {
    nav: {
      home: 'Início',
      about: 'Sobre',
      lia: 'LIA',
      methodology: 'Metodologia',
      solutions: 'Soluções',
      cases: 'Casos de Sucesso',
      contact: 'Contato',
      login: 'Acesso Assinantes',
    },
    hero: {
      title: 'Transformando o Campo com Inteligência Artificial',
      subtitle: 'Democratizamos o acesso à IA no agronegócio para que produtores de todos os portes possam tomar decisões mais inteligentes e eficientes.',
      cta1: 'Conheça a LIA',
      cta2: 'Fale Conosco',
    },
    about: {
      title: 'Quem Somos',
      whoWeAre: 'Transformando o Campo com Inteligência',
      whoWeAreText: 'Nascemos da união de duas paixões: o campo e a tecnologia. Somos uma equipe formada por agrônomos, cientistas da computação e engenheiros que acreditam no potencial da inteligência artificial para revolucionar o agronegócio. Nossa história começou com a percepção de que a tecnologia no campo não precisa ser complicada. Pelo contrário, ela deve ser uma ferramenta que simplifica o dia a dia, aumenta a produtividade e traz mais segurança para o produtor rural.',
      mission: 'Nossa Missão',
      missionText: 'Democratizar o acesso à inteligência artificial no agronegócio. Queremos que produtores de todos os portes possam tomar decisões mais inteligentes e eficientes, baseadas em dados e análises precisas.',
      objective: 'Nosso Objetivo',
      objectiveText: 'Ser o parceiro estratégico que traduz a complexidade da tecnologia em resultados práticos e mensuráveis para a sua fazenda.',
      whyChoose: 'Por que nos escolher?',
      reason1Title: 'Falamos a sua língua',
      reason1Text: 'Entendemos os seus desafios e não usamos jargões técnicos. Focamos no que realmente importa: o resultado na sua fazenda.',
      reason2Title: 'Metodologia Comprovada',
      reason2Text: 'Desenvolvemos a Trilha de Aplicação de IA no Agronegócio (TAIA), um método seguro e gradual para implementar a IA na sua propriedade.',
      reason3Title: 'Foco em Resultados Práticos',
      reason3Text: 'Nosso trabalho só faz sentido se gerar economia, aumentar a produtividade e trazer mais tranquilidade para você.',
    },
    lia: {
      title: 'Conheça a LIA',
      subtitle: 'Seu Assistente de IA Dedicado ao Agronegócio',
      description: 'A LIA é uma inteligência artificial especializada que aprende com os dados da sua propriedade para ajudar você a tomar as melhores decisões. Disponível 24 horas por dia, a LIA analisa operação, clima, solo e imagens para responder suas perguntas e otimizar seus processos.',
      question1: 'Baseado no meu planejamento operacional, todos os itens que vou precisar estão disponíveis no estoque?',
      question2: 'Quais atividades que minha equipe deveria concluir hoje?',
      accessButton: 'Acessar LIA',
    },
    visions: {
      title: 'As 4 Visões de IA no Agronegócio',
      subtitle: 'Da análise à ação: como a inteligência artificial transforma dados em resultados',
      descriptive: 'Descritiva',
      descriptiveText: 'Veja o que está acontecendo.',
      diagnostic: 'Diagnóstica',
      diagnosticText: 'Entenda por que aconteceu.',
      predictive: 'Preditiva',
      predictiveText: 'Antecipe o que pode acontecer.',
      prescriptive: 'Prescritiva',
      prescriptiveText: 'Saiba o que fazer agora.',
    },
    methodology: {
      title: 'Nossa Metodologia TAIA',
      subtitle: 'Trilha de Aplicação de IA no Agronegócio',
      phase1: 'Fase 1',
      phase1Title: 'Viabilidade - Entender o seu desafio',
      phase1Text: 'Nesta primeira etapa, vamos conversar para entender profundamente a sua operação, seus maiores desafios e onde a IA pode gerar mais valor. O objetivo é definir um problema específico para resolvermos juntos.',
      phase2: 'Fase 2',
      phase2Title: 'Estruturação - Organizar a casa',
      phase2Text: 'Com o desafio definido, ajudamos a coletar e organizar as informações importantes da sua propriedade. É como preparar o terreno antes de plantar: garantimos que os dados da sua operação estejam prontos para serem usados pela IA.',
      phase3: 'Fase 3',
      phase3Title: 'Aplicação - Colocar a inteligência para trabalhar',
      phase3Text: 'Aqui desenvolvemos e testamos a solução de IA em um projeto piloto. Começamos pequeno, em uma área controlada, para provar o valor antes de expandir.',
      phase4: 'Fase 4',
      phase4Title: 'Operação - Colher os frutos e expandir',
      phase4Text: 'Com os resultados do piloto em mãos e o valor comprovado, planejamos a expansão da solução para o restante da propriedade. A IA deixa de ser um teste e se torna parte da sua rotina, gerando benefícios em larga escala.',
      whyWorks: 'Por que a TAIA funciona?',
      benefit1Title: 'Começo Pequeno e Seguro',
      benefit1Text: 'Iniciamos sempre com um projeto piloto para provar o valor da solução em uma área controlada, minimizando riscos e o investimento inicial.',
      benefit2Title: 'Decisão Baseada em Fatos',
      benefit2Text: 'A cada fase, usamos checklists de avaliação (Go/No-Go) para decidir, junto com você, se estamos no caminho certo para avançar.',
      benefit3Title: 'Totalmente Personalizado',
      benefit3Text: 'A TAIA não é uma "receita de bolo". Todo o processo é desenhado para atender às necessidades específicas da sua cultura e da sua fazenda.',
    },
    benefits: {
      title: 'Benefícios Reais para a sua Fazenda',
      benefit1: 'Decisões Mais Rápidas e Certas',
      benefit2: 'Gestão Inteligente de Pessoas',
      benefit3: 'Manutenção Preventiva Eficiente',
      benefit4: 'Estratégia de Colheita Otimizada',
    },
    cases: {
      title: 'Casos de Sucesso',
      case1Title: 'Gestão Inteligente de Manutenção',
      case1Text: 'Uma fazenda de soja de 2.000 hectares estava perdendo dias preciosos de plantio devido a quebras inesperadas de tratores e plantadeiras. Implementamos um sistema que analisa o histórico de manutenções, horas de uso e padrões de quebra de cada equipamento. A IA passou a prever quando cada máquina precisaria de manutenção, permitindo que os reparos fossem feitos na entressafra.',
      case1Result: 'Redução de 40% nas paradas não programadas e economia de R$ 180.000 por safra em custos de manutenção corretiva.',
      case2Title: 'Otimização da Alocação de Equipes',
      case2Text: 'Em uma propriedade com múltiplas culturas, analisamos dados de produtividade das equipes de campo ao longo de três safras. Descobrimos que certas equipes rendiam 25% mais em atividades específicas enquanto outras eram mais eficientes na colheita. Com base nesses dados, a IA passou a sugerir a melhor alocação de pessoas para cada atividade.',
      case2Result: 'Aumento de 18% na produtividade geral das equipes e redução de 12% no tempo total das operações de campo.',
    },
    process: {
      title: 'Nosso Processo de Trabalho',
      step1: 'Conversa Inicial',
      step2: 'Proposta de Projeto Piloto',
      step3: 'Implementação e Acompanhamento',
      step4: 'Apresentação de Resultados',
    },
    team: {
      title: 'Uma Equipe que Entende do Assunto',
      profile1: 'Especialistas em Agronegócio e de Campo - Trazem a experiência prática da lavoura',
      profile2: 'Cientistas da Computação - São os cérebros por trás dos modelos de IA',
      profile3: 'Engenheiros de Dados - Garantem que os dados sejam coletados e que a tecnologia funcione perfeitamente',
    },
    cta: {
      title: 'Vamos Começar?',
      subtitle: 'A jornada para o futuro do seu agronegócio começa com um simples passo. Não é preciso fazer grandes investimentos ou mudanças radicais. O primeiro passo é uma conversa.',
      button: 'Agendar Conversa',
    },
    contact: {
      title: 'Entre em Contato',
      name: 'Nome',
      email: 'E-mail',
      phone: 'Telefone',
      message: 'Mensagem',
      send: 'Enviar Mensagem',
      sending: 'Enviando...',
      success: 'Mensagem enviada com sucesso! Entraremos em contato em breve.',
      error: 'Erro ao enviar mensagem. Por favor, tente novamente.',
    },
    footer: {
      about: 'Sobre a LeanLia',
      contact: 'Contato',
      followUs: 'Siga-nos',
      rights: 'Todos os direitos reservados.',
    },
    login: {
      title: 'Acesso Assinantes LIA',
      subtitle: 'Entre com suas credenciais para acessar o assistente de IA',
      email: 'E-mail',
      password: 'Senha',
      button: 'Entrar',
      forgotPassword: 'Esqueceu a senha?',
      noAccount: 'Ainda não é assinante? Entre em contato conosco.',
    },
  },
  en: {
    nav: {
      home: 'Home',
      about: 'About',
      lia: 'LIA',
      methodology: 'Methodology',
      solutions: 'Solutions',
      cases: 'Success Cases',
      contact: 'Contact',
      login: 'Subscriber Access',
    },
    hero: {
      title: 'Transforming Agriculture with Artificial Intelligence',
      subtitle: 'We democratize access to AI in agribusiness so that producers of all sizes can make smarter and more efficient decisions.',
      cta1: 'Meet LIA',
      cta2: 'Contact Us',
    },
    about: {
      title: 'Who We Are',
      whoWeAre: 'Transforming Agriculture with Intelligence',
      whoWeAreText: 'We were born from the union of two passions: agriculture and technology. We are a team formed by agronomists, computer scientists and engineers who believe in the potential of artificial intelligence to revolutionize agribusiness. Our story began with the perception that technology in the field does not need to be complicated. On the contrary, it should be a tool that simplifies daily life, increases productivity and brings more security to rural producers.',
      mission: 'Our Mission',
      missionText: 'Democratize access to artificial intelligence in agribusiness. We want producers of all sizes to be able to make smarter and more efficient decisions based on accurate data and analysis.',
      objective: 'Our Objective',
      objectiveText: 'To be the strategic partner that translates the complexity of technology into practical and measurable results for your farm.',
      whyChoose: 'Why choose us?',
      reason1Title: 'We speak your language',
      reason1Text: 'We understand your challenges and do not use technical jargon. We focus on what really matters: the result on your farm.',
      reason2Title: 'Proven Methodology',
      reason2Text: 'We developed the AI Application Path in Agribusiness (TAIA), a safe and gradual method to implement AI on your property.',
      reason3Title: 'Focus on Practical Results',
      reason3Text: 'Our work only makes sense if it generates savings, increases productivity and brings you more peace of mind.',
    },
    lia: {
      title: 'Meet LIA',
      subtitle: 'Your AI Assistant Dedicated to Agribusiness',
      description: 'LIA is a specialized artificial intelligence that learns from your property data to help you make the best decisions. Available 24 hours a day, LIA analyzes operations, weather, soil and images to answer your questions and optimize your processes.',
      question1: 'Based on my operational planning, are all the items I will need available in stock?',
      question2: 'What activities should my team complete today?',
      accessButton: 'Access LIA',
    },
    visions: {
      title: 'The 4 AI Visions in Agribusiness',
      subtitle: 'From analysis to action: how artificial intelligence transforms data into results',
      descriptive: 'Descriptive',
      descriptiveText: 'See what is happening.',
      diagnostic: 'Diagnostic',
      diagnosticText: 'Understand why it happened.',
      predictive: 'Predictive',
      predictiveText: 'Anticipate what may happen.',
      prescriptive: 'Prescriptive',
      prescriptiveText: 'Know what to do now.',
    },
    methodology: {
      title: 'Our TAIA Methodology',
      subtitle: 'AI Application Path in Agribusiness',
      phase1: 'Phase 1',
      phase1Title: 'Feasibility - Understanding your challenge',
      phase1Text: 'In this first stage, we will talk to deeply understand your operation, your biggest challenges and where AI can generate the most value. The goal is to define a specific problem to solve together.',
      phase2: 'Phase 2',
      phase2Title: 'Structuring - Organizing the house',
      phase2Text: 'With the challenge defined, we help collect and organize the important information from your property. It is like preparing the ground before planting: we ensure that the data from your operation is ready to be used by AI.',
      phase3: 'Phase 3',
      phase3Title: 'Application - Putting intelligence to work',
      phase3Text: 'Here we develop and test the AI solution in a pilot project. We start small, in a controlled area, to prove the value before expanding.',
      phase4: 'Phase 4',
      phase4Title: 'Operation - Harvesting the fruits and expanding',
      phase4Text: 'With the pilot results in hand and the value proven, we plan the expansion of the solution to the rest of the property. AI ceases to be a test and becomes part of your routine, generating benefits on a large scale.',
      whyWorks: 'Why does TAIA work?',
      benefit1Title: 'Small and Safe Start',
      benefit1Text: 'We always start with a pilot project to prove the value of the solution in a controlled area, minimizing risks and initial investment.',
      benefit2Title: 'Fact-Based Decision',
      benefit2Text: 'At each phase, we use evaluation checklists (Go/No-Go) to decide, together with you, if we are on the right path to move forward.',
      benefit3Title: 'Fully Customized',
      benefit3Text: 'TAIA is not a "one-size-fits-all recipe". The entire process is designed to meet the specific needs of your crop and your farm.',
    },
    benefits: {
      title: 'Real Benefits for Your Farm',
      benefit1: 'Faster and Better Decisions',
      benefit2: 'Intelligent People Management',
      benefit3: 'Efficient Preventive Maintenance',
      benefit4: 'Optimized Harvest Strategy',
    },
    cases: {
      title: 'Success Cases',
      case1Title: 'Intelligent Maintenance Management',
      case1Text: 'A 2,000-hectare soybean farm was losing precious planting days due to unexpected breakdowns of tractors and planters. We implemented a system that analyzes the maintenance history, hours of use and breakdown patterns of each equipment. AI began to predict when each machine would need maintenance, allowing repairs to be made during the off-season.',
      case1Result: '40% reduction in unscheduled downtime and savings of R$ 180,000 per harvest in corrective maintenance costs.',
      case2Title: 'Team Allocation Optimization',
      case2Text: 'On a property with multiple crops, we analyzed productivity data from field teams over three harvests. We found that certain teams performed 25% better in specific activities while others were more efficient at harvesting. Based on this data, AI began to suggest the best allocation of people for each activity.',
      case2Result: '18% increase in overall team productivity and 12% reduction in total field operation time.',
    },
    process: {
      title: 'Our Work Process',
      step1: 'Initial Conversation',
      step2: 'Pilot Project Proposal',
      step3: 'Implementation and Monitoring',
      step4: 'Results Presentation',
    },
    team: {
      title: 'A Team That Knows the Subject',
      profile1: 'Agribusiness and Field Specialists - Bring practical farming experience',
      profile2: 'Computer Scientists - The brains behind AI models',
      profile3: 'Data Engineers - Ensure data is collected and technology works perfectly',
    },
    cta: {
      title: "Let's Get Started?",
      subtitle: 'The journey to the future of your agribusiness begins with a simple step. No need to make large investments or radical changes. The first step is a conversation.',
      button: 'Schedule Conversation',
    },
    contact: {
      title: 'Get in Touch',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      message: 'Message',
      send: 'Send Message',
      sending: 'Sending...',
      success: 'Message sent successfully! We will contact you soon.',
      error: 'Error sending message. Please try again.',
    },
    footer: {
      about: 'About LeanLia',
      contact: 'Contact',
      followUs: 'Follow Us',
      rights: 'All rights reserved.',
    },
    login: {
      title: 'LIA Subscriber Access',
      subtitle: 'Enter your credentials to access the AI assistant',
      email: 'Email',
      password: 'Password',
      button: 'Sign In',
      forgotPassword: 'Forgot password?',
      noAccount: 'Not a subscriber yet? Contact us.',
    },
  },
  es: {
    nav: {
      home: 'Inicio',
      about: 'Sobre',
      lia: 'LIA',
      methodology: 'Metodología',
      solutions: 'Soluciones',
      cases: 'Casos de Éxito',
      contact: 'Contacto',
      login: 'Acceso Suscriptores',
    },
    hero: {
      title: 'Transformando el Campo con Inteligencia Artificial',
      subtitle: 'Democratizamos el acceso a la IA en el agronegocio para que productores de todos los tamaños puedan tomar decisiones más inteligentes y eficientes.',
      cta1: 'Conoce a LIA',
      cta2: 'Contáctanos',
    },
    about: {
      title: 'Quiénes Somos',
      whoWeAre: 'Transformando el Campo con Inteligencia',
      whoWeAreText: 'Nacimos de la unión de dos pasiones: el campo y la tecnología. Somos un equipo formado por agrónomos, científicos de la computación e ingenieros que creen en el potencial de la inteligencia artificial para revolucionar el agronegocio. Nuestra historia comenzó con la percepción de que la tecnología en el campo no necesita ser complicada. Por el contrario, debe ser una herramienta que simplifica el día a día, aumenta la productividad y brinda más seguridad al productor rural.',
      mission: 'Nuestra Misión',
      missionText: 'Democratizar el acceso a la inteligencia artificial en el agronegocio. Queremos que productores de todos los tamaños puedan tomar decisiones más inteligentes y eficientes, basadas en datos y análisis precisos.',
      objective: 'Nuestro Objetivo',
      objectiveText: 'Ser el socio estratégico que traduce la complejidad de la tecnología en resultados prácticos y medibles para su finca.',
      whyChoose: '¿Por qué elegirnos?',
      reason1Title: 'Hablamos tu idioma',
      reason1Text: 'Entendemos tus desafíos y no usamos jerga técnica. Nos enfocamos en lo que realmente importa: el resultado en tu finca.',
      reason2Title: 'Metodología Comprobada',
      reason2Text: 'Desarrollamos la Ruta de Aplicación de IA en el Agronegocio (TAIA), un método seguro y gradual para implementar la IA en su propiedad.',
      reason3Title: 'Enfoque en Resultados Prácticos',
      reason3Text: 'Nuestro trabajo solo tiene sentido si genera economía, aumenta la productividad y te brinda más tranquilidad.',
    },
    lia: {
      title: 'Conoce a LIA',
      subtitle: 'Tu Asistente de IA Dedicado al Agronegocio',
      description: 'LIA es una inteligencia artificial especializada que aprende de los datos de su propiedad para ayudarlo a tomar las mejores decisiones. Disponible las 24 horas del día, LIA analiza operaciones, clima, suelo e imágenes para responder sus preguntas y optimizar sus procesos.',
      question1: 'Según mi planificación operativa, ¿todos los artículos que necesitaré están disponibles en stock?',
      question2: '¿Qué actividades debería completar mi equipo hoy?',
      accessButton: 'Acceder a LIA',
    },
    visions: {
      title: 'Las 4 Visiones de IA en el Agronegocio',
      subtitle: 'Del análisis a la acción: cómo la inteligencia artificial transforma datos en resultados',
      descriptive: 'Descriptiva',
      descriptiveText: 'Vea lo que está sucediendo.',
      diagnostic: 'Diagnóstica',
      diagnosticText: 'Entienda por qué sucedió.',
      predictive: 'Predictiva',
      predictiveText: 'Anticipe lo que puede suceder.',
      prescriptive: 'Prescriptiva',
      prescriptiveText: 'Sepa qué hacer ahora.',
    },
    methodology: {
      title: 'Nuestra Metodología TAIA',
      subtitle: 'Ruta de Aplicación de IA en el Agronegocio',
      phase1: 'Fase 1',
      phase1Title: 'Viabilidad - Entender su desafío',
      phase1Text: 'En esta primera etapa, conversaremos para entender profundamente su operación, sus mayores desafíos y dónde la IA puede generar más valor. El objetivo es definir un problema específico para resolver juntos.',
      phase2: 'Fase 2',
      phase2Title: 'Estructuración - Organizar la casa',
      phase2Text: 'Con el desafío definido, ayudamos a recopilar y organizar la información importante de su propiedad. Es como preparar el terreno antes de plantar: nos aseguramos de que los datos de su operación estén listos para ser utilizados por la IA.',
      phase3: 'Fase 3',
      phase3Title: 'Aplicación - Poner la inteligencia a trabajar',
      phase3Text: 'Aquí desarrollamos y probamos la solución de IA en un proyecto piloto. Comenzamos pequeño, en un área controlada, para probar el valor antes de expandir.',
      phase4: 'Fase 4',
      phase4Title: 'Operación - Cosechar los frutos y expandir',
      phase4Text: 'Con los resultados del piloto en mano y el valor comprobado, planificamos la expansión de la solución al resto de la propiedad. La IA deja de ser una prueba y se convierte en parte de su rutina, generando beneficios a gran escala.',
      whyWorks: '¿Por qué funciona TAIA?',
      benefit1Title: 'Comienzo Pequeño y Seguro',
      benefit1Text: 'Siempre comenzamos con un proyecto piloto para probar el valor de la solución en un área controlada, minimizando riesgos y la inversión inicial.',
      benefit2Title: 'Decisión Basada en Hechos',
      benefit2Text: 'En cada fase, utilizamos listas de verificación de evaluación (Go/No-Go) para decidir, junto con usted, si estamos en el camino correcto para avanzar.',
      benefit3Title: 'Totalmente Personalizado',
      benefit3Text: 'TAIA no es una "receta única". Todo el proceso está diseñado para satisfacer las necesidades específicas de su cultivo y su finca.',
    },
    benefits: {
      title: 'Beneficios Reales para su Finca',
      benefit1: 'Decisiones Más Rápidas y Mejores',
      benefit2: 'Gestión Inteligente de Personas',
      benefit3: 'Mantenimiento Preventivo Eficiente',
      benefit4: 'Estrategia de Cosecha Optimizada',
    },
    cases: {
      title: 'Casos de Éxito',
      case1Title: 'Gestión Inteligente de Mantenimiento',
      case1Text: 'Una finca de soja de 2,000 hectáreas estaba perdiendo días preciosos de siembra debido a averías inesperadas de tractores y sembradoras. Implementamos un sistema que analiza el historial de mantenimiento, horas de uso y patrones de averías de cada equipo. La IA comenzó a predecir cuándo cada máquina necesitaría mantenimiento, permitiendo que las reparaciones se realizaran durante la temporada baja.',
      case1Result: 'Reducción del 40% en paradas no programadas y ahorro de R$ 180,000 por cosecha en costos de mantenimiento correctivo.',
      case2Title: 'Optimización de Asignación de Equipos',
      case2Text: 'En una propiedad con múltiples cultivos, analizamos datos de productividad de equipos de campo durante tres cosechas. Descubrimos que ciertos equipos rendían un 25% más en actividades específicas mientras que otros eran más eficientes en la cosecha. Con base en estos datos, la IA comenzó a sugerir la mejor asignación de personas para cada actividad.',
      case2Result: 'Aumento del 18% en la productividad general del equipo y reducción del 12% en el tiempo total de operaciones de campo.',
    },
    process: {
      title: 'Nuestro Proceso de Trabajo',
      step1: 'Conversación Inicial',
      step2: 'Propuesta de Proyecto Piloto',
      step3: 'Implementación y Seguimiento',
      step4: 'Presentación de Resultados',
    },
    team: {
      title: 'Un Equipo que Conoce el Tema',
      profile1: 'Especialistas en Agronegocio y de Campo - Aportan experiencia práctica de la agricultura',
      profile2: 'Científicos de la Computación - Los cerebros detrás de los modelos de IA',
      profile3: 'Ingenieros de Datos - Garantizan que los datos se recopilen y que la tecnología funcione perfectamente',
    },
    cta: {
      title: '¿Empezamos?',
      subtitle: 'El viaje hacia el futuro de su agronegocio comienza con un simple paso. No es necesario hacer grandes inversiones o cambios radicales. El primer paso es una conversación.',
      button: 'Programar Conversación',
    },
    contact: {
      title: 'Póngase en Contacto',
      name: 'Nombre',
      email: 'Correo electrónico',
      phone: 'Teléfono',
      message: 'Mensaje',
      send: 'Enviar Mensaje',
      sending: 'Enviando...',
      success: '¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.',
      error: 'Error al enviar mensaje. Por favor, inténtelo de nuevo.',
    },
    footer: {
      about: 'Sobre LeanLia',
      contact: 'Contacto',
      followUs: 'Síguenos',
      rights: 'Todos los derechos reservados.',
    },
    login: {
      title: 'Acceso Suscriptores LIA',
      subtitle: 'Ingrese sus credenciales para acceder al asistente de IA',
      email: 'Correo electrónico',
      password: 'Contraseña',
      button: 'Iniciar Sesión',
      forgotPassword: '¿Olvidó su contraseña?',
      noAccount: '¿Aún no es suscriptor? Contáctenos.',
    },
  },
};

