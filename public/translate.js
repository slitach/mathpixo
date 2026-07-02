// ==========================================================================
// Mathpixo Localization & Internationalization (i18n) Engine
// Supports English, French, Spanish, and Arabic (with RTL formatting)
// ==========================================================================

const i18n = {
  en: {
    // Nav
    about: "About",
    pricing: "Pricing",
    contact: "Contact",
    workspace: "Workspace",
    open_workspace: "Open Workspace",
    back_workspace: "Workspace",
    
    // Landing
    hero_title: "Extract LaTeX, Markdown, or TikZ from PDF and Images",
    hero_subtitle: "The standard for accurate scientific document conversion. Capture equations, diagrams, and formatting trees, and turn them into perfect digital compilation code instantly.",
    try_browser: "Try it in your browser",
    drag_drop: "Drag & drop a math image or PDF here to start converting instantly",
    reading_doc: "Reading document...",
    designed_creators: "Designed for Technical Content Creators",
    designed_subtitle: "Instantly digitize scientific documents without the headache of manual transcription.",
    feature_1_title: "Snip Web App",
    feature_1_desc: "A fully-equipped multi-page workspace. Edit, preview, and bundle your converted formulas directly inside a clean, compilable project document.",
    feature_2_title: "Multimodal PDF Ingestion",
    feature_2_desc: "No more manual re-typing of scientific papers. Upload entire multi-page PDF files and translate full lists of formulas at once.",
    feature_3_title: "TikZ Vector Drawing",
    feature_3_desc: "Convert function graphs, block diagrams, and system coordinates into compilable TikZ and pgfplots packages directly.",
    inspired_by: "Inspired by Mathpix Snip. All rights reserved.",
    
    // Workspace Sidebar & Actions
    plans: "Plans",
    tagline: "Mathpix Companion",
    add_pages: "Add PDF or Images",
    page_singular: "page",
    page_plural: "pages",
    clear_all: "Clear All",
    empty_workspace_title: "Your Workspace is Empty",
    empty_workspace_subtitle: "Drop math images, screenshots, or PDF files here to begin your digitization project.",
    upload_files: "Upload Files",
    delete_page: "Delete Page",
    convert_all: "Convert All Pages",
    convert_page: "Convert This Page",
    latex_editor: "LaTeX Code Editor",
    copy_latex: "Copy LaTeX",
    full_document: "Full Document",
    complete_project: "Complete LaTeX Project Document (.tex)",
    open_overleaf: "Open in Overleaf",
    download_tex: "Download .tex",
    placeholder_editor: "Click 'Convert This Page' to extract formulas...",
    placeholder_combined: "All converted pages will be merged here into a compilable document...",
    converting_overlay: "Extracting formulas using Gemini...",
    
    // Pricing
    pricing_title: "Mathpixo Snip Pricing",
    pricing_subtitle: "Simple, transparent pricing for turning handwritten equations and technical documents into perfect digital formats.",
    monthly: "Monthly",
    yearly: "Yearly",
    save_percent: "Save ~20%",
    occasional_use: "For occasional use",
    students_users: "For students and everyday users.",
    get_started: "Get Started",
    active_sub: "Active Subscription",
    upgrade_org: "Upgrade to Org",
    downgrade_pro: "Downgrade to Pro",
    for_teams: "For Teams",
    teams_desc: "For departments, schools, and companies.",
    enterprise: "Enterprise",
    enterprise_desc: "For organizations needing a flexible, long-term solution.",
    contact_sales: "Contact Sales",
    confirm_upgrade: "Confirm Upgrade",
    secure_checkout: "Secure checkout with PayPal",
    total_due: "Total Due:",
    pro_plan: "Pro",
    org_plan: "Organization",
    free_plan: "Free & Educational",
    
    // About
    about_title: "About Mathpixo",
    about_subtitle: "Making mathematical content accessible and digitizable",
    about_desc1: "Mathpixo is a modern productivity tool built to solve a persistent bottleneck in STEM workflows: digitizing mathematics. We believe that equations, graphs, and control block diagrams should be as easy to type, search, and edit as plain text.",
    about_desc2: "By combining advanced multimodal AI (using Google Gemini 2.5 Flash) with custom rendering libraries, Mathpixo allows researchers, students, and educators to instantly convert screenshots, photos, and full PDF documents of formulas into high-quality, compilable LaTeX code.",
    core_tech: "Core Technology",
    vision_title: "Our Vision",
    vision_desc: "Writing LaTeX code manually is time-consuming. Our vision is to eliminate the friction in scientific and technical writing, helping authors and students focus on the content rather than the syntax. Whether you are copy-pasting equations into Overleaf or building course lecture notes, Mathpixo is your ultimate companion.",
    
    // Contact
    contact_title: "Get In Touch",
    contact_subtitle: "Have questions about plans, custom pricing, or developer integrations? Our support team is here to help.",
    send_msg: "Send a Message",
    form_subtitle: "Fill out the form below and we will get back to you within 24 hours.",
    full_name: "Full Name",
    email_address: "Email Address",
    subject: "Subject",
    message: "Message",
    send_btn: "Send Message",
    msg_sent: "Message Sent!",
    msg_sent_desc: "Thank you for reaching out. A support ticket has been opened and our team will get in touch with you shortly.",
    send_another: "Send Another",
    
    // Sidebar Status & Rendering placeholders
    status_pending: "Pending",
    status_converting: "Converting...",
    status_converted: "Converted",
    status_error: "Error",
    conversion_error: "Conversion Error",
    failed_process_image: "Failed to process image.",
    click_convert_placeholder: 'Click "Convert This Page" to display preview.',
    diagram_generated: "Diagram Generated",
    diagram_not_rendered: "This diagram uses standard packages that cannot be rendered in HTML. The complete LaTeX code has been generated above and is ready to copy-paste into your LaTeX editor (like Overleaf)!",
    could_not_render_preview: "Could not render mathematics in preview. Raw code is in the code tab."
  },
  fr: {
    // Nav
    about: "À propos",
    pricing: "Tarifs",
    contact: "Contact",
    workspace: "Espace de travail",
    open_workspace: "Ouvrir l'espace",
    back_workspace: "Espace de travail",
    
    // Landing
    hero_title: "Extrayez du LaTeX, Markdown ou TikZ à partir de PDF et d'images",
    hero_subtitle: "La référence pour la conversion de documents scientifiques. Capturez les équations, diagrammes et structures et transformez-les instantanément en code de compilation numérique parfait.",
    try_browser: "Essayez dans votre navigateur",
    drag_drop: "Glissez-déposez une image ou un PDF de maths ici pour lancer la conversion",
    reading_doc: "Lecture du document...",
    designed_creators: "Conçu pour les créateurs de contenu technique",
    designed_subtitle: "Numérisez instantanément des documents scientifiques sans le casse-tête de la saisie manuelle.",
    feature_1_title: "Application Web Snip",
    feature_1_desc: "Un espace multi-pages complet. Modifiez, prévisualisez et exportez vos formules dans un document LaTeX compilable.",
    feature_2_title: "Scannérisation de PDF",
    feature_2_desc: "Plus besoin de retaper manuellement les articles de recherche. Téléchargez des fichiers PDF multi-pages et convertissez-les en bloc.",
    feature_3_title: "Dessins Vectoriels TikZ",
    feature_3_desc: "Convertissez les tracés de fonctions, axes de coordonnées et diagrammes de blocs en codes TikZ et pgfplots.",
    inspired_by: "Inspiré par Mathpix Snip. Tous droits réservés.",
    
    // Workspace Sidebar & Actions
    plans: "Tarifs",
    tagline: "Compagnon Mathpix",
    add_pages: "Ajouter PDF ou Images",
    page_singular: "page",
    page_plural: "pages",
    clear_all: "Effacer tout",
    empty_workspace_title: "Votre espace de travail est vide",
    empty_workspace_subtitle: "Déposez des images de maths ou des fichiers PDF ici pour commencer.",
    upload_files: "Télécharger des fichiers",
    delete_page: "Supprimer la page",
    convert_all: "Convertir toutes les pages",
    convert_page: "Convertir cette page",
    latex_editor: "Éditeur de code LaTeX",
    copy_latex: "Copier le LaTeX",
    full_document: "Document complet",
    complete_project: "Projet LaTeX complet (.tex)",
    open_overleaf: "Ouvrir dans Overleaf",
    download_tex: "Télécharger .tex",
    placeholder_editor: "Cliquez sur 'Convertir cette page' pour extraire les formules...",
    placeholder_combined: "Toutes les pages converties seront fusionnées ici dans un document compilable...",
    converting_overlay: "Extraction des formules via Gemini...",
    
    // Pricing
    pricing_title: "Tarification Mathpixo",
    pricing_subtitle: "Des prix simples et transparents pour transformer des équations manuscrites et des documents en formats numériques parfaits.",
    monthly: "Mensuel",
    yearly: "Annuel",
    save_percent: "Économisez ~20%",
    occasional_use: "Pour un usage occasionnel",
    students_users: "Pour les étudiants et utilisateurs occasionnels.",
    get_started: "Commencer",
    active_sub: "Abonnement Actif",
    upgrade_org: "Passer à l'Org",
    downgrade_pro: "Rétrograder vers Pro",
    for_teams: "Pour les équipes",
    teams_desc: "Pour les départements, écoles et entreprises.",
    enterprise: "Entreprise",
    enterprise_desc: "Pour les organisations ayant besoin d'une solution sur mesure.",
    contact_sales: "Contacter le service commercial",
    confirm_upgrade: "Confirmer l'abonnement",
    secure_checkout: "Paiement sécurisé via PayPal",
    total_due: "Total dû :",
    pro_plan: "Pro",
    org_plan: "Organisation",
    free_plan: "Gratuit & Éducation",
    
    // About
    about_title: "À propos de Mathpixo",
    about_subtitle: "Rendre le contenu mathématique accessible et éditable",
    about_desc1: "Mathpixo est un outil de productivité moderne créé pour résoudre un problème récurrent dans les flux de travail scientifiques : la numérisation des mathématiques. Nous pensons que les équations, graphiques et diagrammes devraient être aussi simples à saisir et modifier que du texte brut.",
    about_desc2: "En associant l'intelligence artificielle multimodale (Google Gemini 2.5 Flash) à nos librairies de rendu, Mathpixo permet d'exporter instantanément des captures d'écran et des documents PDF vers du code LaTeX propre et fonctionnel.",
    core_tech: "Technologie de pointe",
    vision_title: "Notre Vision",
    vision_desc: "Saisir du code LaTeX à la main est fastidieux. Notre but est de simplifier l'écriture scientifique pour permettre aux auteurs et étudiants de se focaliser sur le contenu plutôt que sur la syntaxe. Que vous exportiez vers Overleaf ou rédigiez des cours, Mathpixo est votre partenaire idéal.",
    
    // Contact
    contact_title: "Contactez-nous",
    contact_subtitle: "Des questions sur les abonnements, les tarifs personnalisés ou les API ? Notre équipe vous répond.",
    send_msg: "Envoyer un message",
    form_subtitle: "Remplissez le formulaire et nous vous répondrons sous 24 heures.",
    full_name: "Nom complet",
    email_address: "Adresse e-mail",
    subject: "Sujet",
    message: "Message",
    send_btn: "Envoyer le message",
    msg_sent: "Message envoyé !",
    msg_sent_desc: "Merci pour votre message. Un ticket d'assistance a été créé et nos conseillers vous recontacteront rapidement.",
    send_another: "Envoyer un autre",
    
    // Sidebar Status & Rendering placeholders
    status_pending: "En attente",
    status_converting: "Conversion...",
    status_converted: "Converti",
    status_error: "Erreur",
    conversion_error: "Erreur de conversion",
    failed_process_image: "Échec du traitement de l'image.",
    click_convert_placeholder: "Cliquez sur 'Convertir cette page' pour afficher l'aperçu.",
    diagram_generated: "Diagramme généré",
    diagram_not_rendered: "Ce diagramme utilise des packages standard qui ne peuvent pas être rendus en HTML. Le code LaTeX complet a été généré ci-dessus et est prêt à être copié-collé dans votre éditeur LaTeX (comme Overleaf)!",
    could_not_render_preview: "Impossible de générer le rendu mathématique. Le code brut est dans l'onglet code."
  },
  es: {
    // Nav
    about: "Nosotros",
    pricing: "Precios",
    contact: "Contacto",
    workspace: "Área de trabajo",
    open_workspace: "Abrir espacio",
    back_workspace: "Área de trabajo",
    
    // Landing
    hero_title: "Extrae LaTeX, Markdown o TikZ de PDF e imágenes",
    hero_subtitle: "El estándar para la conversión precisa de documentos científicos. Captura ecuaciones, diagramas y formatos y conviértelos al instante en código digital listo para compilar.",
    try_browser: "Pruébalo en tu navegador",
    drag_drop: "Arrastra y suelta una imagen matemática o PDF aquí para convertir al instante",
    reading_doc: "Leyendo documento...",
    designed_creators: "Diseñado para creadores de contenido técnico",
    designed_subtitle: "Digitaliza al instante documentos científicos sin el dolor de cabeza de la transcripción manual.",
    feature_1_title: "Aplicación Web Snip",
    feature_1_desc: "Un espacio de trabajo multipágina completo. Edita, previsualiza y compila tus fórmulas en un documento LaTeX estructurado.",
    feature_2_title: "Conversión de PDF",
    feature_2_desc: "Ya no tienes que volver a transcribir documentos de investigación. Sube archivos PDF completos y procesa varias páginas de una vez.",
    feature_3_title: "Dibujos Vectoriales TikZ",
    feature_3_desc: "Convierte funciones gráficas, diagramas de bloques y sistemas de coordenadas a código compilable en paquetes TikZ y pgfplots.",
    inspired_by: "Inspirado por Mathpix Snip. Todos los derechos reservados.",
    
    // Workspace Sidebar & Actions
    plans: "Planes",
    tagline: "Compañero de Mathpix",
    add_pages: "Añadir PDF o Imágenes",
    page_singular: "página",
    page_plural: "páginas",
    clear_all: "Borrar todo",
    empty_workspace_title: "Tu área de trabajo está vacía",
    empty_workspace_subtitle: "Arrastra imágenes matemáticas o archivos PDF aquí para empezar tu proyecto.",
    upload_files: "Subir archivos",
    delete_page: "Eliminar página",
    convert_all: "Convertir todas las páginas",
    convert_page: "Convertir esta página",
    latex_editor: "Editor de código LaTeX",
    copy_latex: "Copiar LaTeX",
    full_document: "Documento completo",
    complete_project: "Documento de proyecto LaTeX (.tex)",
    open_overleaf: "Abrir en Overleaf",
    download_tex: "Descargar .tex",
    placeholder_editor: "Haz clic en 'Convertir esta página' para extraer fórmulas...",
    placeholder_combined: "Todas las páginas convertidas se fusionarán aquí en un documento compilable...",
    converting_overlay: "Extrayendo fórmulas usando Gemini...",
    
    // Pricing
    pricing_title: "Precios de Mathpixo",
    pricing_subtitle: "Precios sencillos y transparentes para convertir ecuaciones escritas a mano y documentos a formatos digitales perfectos.",
    monthly: "Mensual",
    yearly: "Anual",
    save_percent: "Ahorra ~20%",
    occasional_use: "Para uso ocasional",
    students_users: "Para estudiantes y usuarios cotidianos.",
    get_started: "Empezar",
    active_sub: "Suscripción Activa",
    upgrade_org: "Subir a Org",
    downgrade_pro: "Bajar a Pro",
    for_teams: "Para Equipos",
    teams_desc: "Para departamentos, colegios y empresas.",
    enterprise: "Enterprise",
    enterprise_desc: "Para organizaciones que necesitan soluciones flexibles a largo plazo.",
    contact_sales: "Contactar con ventas",
    confirm_upgrade: "Confirmar Upgrade",
    secure_checkout: "Pago seguro con PayPal",
    total_due: "Total a pagar:",
    pro_plan: "Pro",
    org_plan: "Organización",
    free_plan: "Gratuito y Educativo",
    
    // About
    about_title: "Sobre Mathpixo",
    about_subtitle: "Haciendo accesible y digitalizable el contenido matemático",
    about_desc1: "Mathpixo es una herramienta moderna de productividad diseñada para resolver una dificultad clásica en STEM: digitalizar matemáticas. Creemos que ecuaciones, gráficos y diagramas deben ser tan fáciles de escribir y editar como el texto regular.",
    about_desc2: "Al combinar la IA multimodal avanzada (Google Gemini 2.5 Flash) con librerías de renderizado, Mathpixo permite a científicos, estudiantes y educadores convertir imágenes y PDF en código LaTeX compilable al instante.",
    core_tech: "Tecnología Principal",
    vision_title: "Nuestra Visión",
    vision_desc: "Escribir código LaTeX manualmente consume mucho tiempo. Nuestra visión es eliminar la fricción en la redacción científica, ayudando a los autores a centrarse en el contenido. Tanto si trabajas con Overleaf como si preparas apuntes, Mathpixo es tu mejor aliado.",
    
    // Contact
    contact_title: "Ponte en contacto",
    contact_subtitle: "¿Tienes preguntas sobre planes, precios personalizados o integraciones? Nuestro equipo te ayuda.",
    send_msg: "Enviar mensaje",
    form_subtitle: "Completa el formulario y te responderemos en menos de 24 horas.",
    full_name: "Nombre completo",
    email_address: "Correo electrónico",
    subject: "Asunto",
    message: "Mensaje",
    send_btn: "Enviar mensaje",
    msg_sent: "¡Mensaje enviado!",
    msg_sent_desc: "Gracias por contactar con nosotros. Se ha abierto un ticket de soporte y nuestro equipo te responderá pronto.",
    send_another: "Enviar otro",
    
    // Sidebar Status & Rendering placeholders
    status_pending: "Pendiente",
    status_converting: "Convirtiendo...",
    status_converted: "Convertido",
    status_error: "Error",
    conversion_error: "Error de conversión",
    failed_process_image: "Error al procesar la imagen.",
    click_convert_placeholder: "Haz clic en 'Convertir esta página' para ver la vista previa.",
    diagram_generated: "Diagrama generado",
    diagram_not_rendered: "Este diagrama utiliza paquetes estándar que no se pueden renderizar en HTML. ¡El código LaTeX completo se ha generado arriba y está listo para copiar y pegar en su editor LaTeX (como Overleaf)!",
    could_not_render_preview: "No se pudieron renderizar las matemáticas en la vista previa. El código fuente está en la pestaña de código."
  },
  ar: {
    // Nav
    about: "حول",
    pricing: "الأسعار",
    contact: "اتصل بنا",
    workspace: "مساحة العمل",
    open_workspace: "افتح مساحة العمل",
    back_workspace: "مساحة العمل",
    
    // Landing
    hero_title: "استخرج معادلات LaTeX أو Markdown أو TikZ من الصور وملفات PDF",
    hero_subtitle: "المعيار الرائد للتحويل الدقيق للمستندات العلمية. التقط المعادلات، والرسوم البيانية، وهياكل التنسيق، وحوّلها على الفور إلى كود برمجي جاهز للترجمة الرقمية.",
    try_browser: "جرب الخدمة في متصفحك",
    drag_drop: "اسحب وأسقط صورة رياضية أو ملف PDF هنا للبدء في التحويل فوراً",
    reading_doc: "جاري قراءة المستند...",
    designed_creators: "مُصمم لمنشئي المحتوى التقني",
    designed_subtitle: "قم برقمة المستندات العلمية على الفور دون عناء الكتابة اليدوية.",
    feature_1_title: "تطبيق ويب Snip",
    feature_1_desc: "مساحة عمل متعددة الصفحات مجهزة بالكامل. قم بتحرير ومعاينة وتجميع المعادلات المحولة مباشرة داخل مستند مشروع LaTeX نظيف وجاهز للترجمة.",
    feature_2_title: "معالجة ملفات PDF",
    feature_2_desc: "لا مزيد من إعادة كتابة الأوراق العلمية يدوياً. قم بتحميل ملفات PDF كاملة متعددة الصفحات وترجمها دفعة واحدة.",
    feature_3_title: "رسوم TikZ المتجهة",
    feature_3_desc: "قم بتحويل منحنيات الدوال ومخططات الكتل وأنظمة الإحداثيات إلى أكواد حزم TikZ و pgfplots مباشرة.",
    inspired_by: "مستوحى من تطبيق Mathpix Snip. جميع الحقوق محفوظة.",
    
    // Workspace Sidebar & Actions
    plans: "الباقات",
    tagline: "مرافق Mathpix",
    add_pages: "إضافة ملف PDF أو صور",
    page_singular: "صفحة",
    page_plural: "صفحات",
    clear_all: "مسح الكل",
    empty_workspace_title: "مساحة العمل فارغة",
    empty_workspace_subtitle: "اسحب وأسقط صور الرياضيات أو ملفات PDF هنا لبدء مشروع الرقمنة الخاص بك.",
    upload_files: "تحميل الملفات",
    delete_page: "حذف الصفحة",
    convert_all: "تحويل جميع الصفحات",
    convert_page: "تحويل هذه الصفحة",
    latex_editor: "محرر أكواد LaTeX",
    copy_latex: "نسخ كود LaTeX",
    full_document: "المستند الكامل",
    complete_project: "مستند مشروع LaTeX الكامل (.tex)",
    open_overleaf: "افتح في Overleaf",
    download_tex: "تحميل ملف .tex",
    placeholder_editor: "اضغط على 'تحويل هذه الصفحة' لاستخراج المعادلات...",
    placeholder_combined: "سيتم دمج جميع الصفحات المحولة هنا في مستند واحد قابل للترجمة...",
    converting_overlay: "جاري استخراج المعادلات بواسطة Gemini...",
    
    // Pricing
    pricing_title: "أسعار Mathpixo",
    pricing_subtitle: "أسعار بسيطة وشفافة لتحويل المعادلات المكتوبة بخط اليد والمستندات التقنية إلى تنسيقات رقمية مثالية.",
    monthly: "شهرياً",
    yearly: "سنوياً",
    save_percent: "وفر حوالي 20%",
    occasional_use: "للاستخدام العرضي",
    students_users: "للطلاب والمستخدمين اليوميين.",
    get_started: "البدء الآن",
    active_sub: "الاشتراك نشط",
    upgrade_org: "ترقية إلى باقة المؤسسات",
    downgrade_pro: "تراجع إلى باقة Pro",
    for_teams: "للفرق والمجموعات",
    teams_desc: "للأقسام والمدارس والشركات.",
    enterprise: "الشركات الكبرى",
    enterprise_desc: "للمؤسسات التي تحتاج إلى حلول مرنة وطويلة المدى.",
    contact_sales: "الاتصال بالمبيعات",
    confirm_upgrade: "تأكيد الترقية",
    secure_checkout: "دفع آمن بواسطة PayPal",
    total_due: "المجموع المستحق:",
    pro_plan: "باقة Pro",
    org_plan: "باقة المؤسسات",
    free_plan: "مجاني وتعليمي",
    
    // About
    about_title: "حول Mathpixo",
    about_subtitle: "جعل المحتوى الرياضي متاحاً وقابلاً للرقمنة",
    about_desc1: "تطبيق Mathpixo هو أداة إنتاجية حديثة تم بناؤها لحل مشكلة متكررة في مسارات عمل العلوم والرياضيات: رقمنة الرياضيات. نحن نؤمن بأن المعادلات والرسوم البيانية والمخططات يجب أن تكون سهلة الكتابة والبحث والتعديل تماماً مثل النصوص العادية.",
    about_desc2: "من خلال الجمع بين الذكاء الاصطناعي متعدد الوسائط المتقدم (باستخدام Google Gemini 2.5 Flash) مع مكتبات الرندرة المخصصة، يتيح Mathpixo للباحثين والطلاب والمعلمين تحويل لقطات الشاشة والصور وملفات PDF الكاملة إلى أكواد LaTeX عالية الجودة فوراً.",
    core_tech: "التقنيات الأساسية",
    vision_title: "رؤيتنا",
    vision_desc: "كتابة أكواد LaTeX يدوياً تستغرق الكثير من الوقت. رؤيتنا هي إزالة العوائق في الكتابة العلمية والتقنية، ومساعدة المؤلفين والطلاب على التركيز على المحتوى بدلاً من قواعد الكود. سواء كنت تنسخ المعادلات إلى Overleaf أو تقوم بإعداد محاضراتك الدراسية، فإن Mathpixo هو رفيقك المثالي.",
    
    // Contact
    contact_title: "تواصل معنا",
    contact_subtitle: "هل لديك أسئلة حول الباقات أو الأسعار المخصصة أو تكامل المطورين؟ فريق الدعم لدينا هنا للمساعدة.",
    send_msg: "أرسل رسالة",
    form_subtitle: "املأ النموذج أدناه وسنرد عليك في غضون 24 ساعة.",
    full_name: "الاسم الكامل",
    email_address: "البريد الإلكتروني",
    subject: "الموضوع",
    message: "الرسالة",
    send_btn: "إرسال الرسالة",
    msg_sent: "تم إرسال الرسالة!",
    msg_sent_desc: "شكراً لتواصلك معنا. تم فتح تذكرة دعم وسيتواصل معك فريقنا قريباً.",
    send_another: "إرسال رسالة أخرى",
    
    // Sidebar Status & Rendering placeholders
    status_pending: "قيد الانتظار",
    status_converting: "جاري التحويل...",
    status_converted: "تم التحويل",
    status_error: "خطأ",
    conversion_error: "خطأ في التحويل",
    failed_process_image: "فشل في معالجة الصورة.",
    click_convert_placeholder: "اضغط على 'تحويل هذه الصفحة' لعرض المعاينة.",
    diagram_generated: "تم إنشاء المخطط",
    diagram_not_rendered: "يستخدم هذا المخطط حزمًا قياسية لا يمكن عرضها في HTML. تم إنشاء كود LaTeX الكامل أعلاه وهو جاهز للنسخ واللصق في محرر LaTeX (مثل Overleaf)!",
    could_not_render_preview: "تعذر عرض الرياضيات في المعاينة. الكود الخام موجود في علامة تبويب الكود."
  }
};

// ==========================================================================
// Translation Engine Initialization and Event Listeners
// ==========================================================================

function applyTranslations(lang) {
  const elements = document.querySelectorAll("[data-i18n]");
  elements.forEach(el => {
    const key = el.getAttribute("data-i18n");
    const val = i18n[lang] ? i18n[lang][key] : null;
    
    if (val) {
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.placeholder = val;
      } else {
        el.innerHTML = val;
      }
    }
  });

  // Toggle layout direction (RTL/LTR)
  if (lang === "ar") {
    document.documentElement.dir = "rtl";
    document.documentElement.lang = "ar";
    document.body.classList.add("rtl-mode");
  } else {
    document.documentElement.dir = "ltr";
    document.documentElement.lang = lang;
    document.body.classList.remove("rtl-mode");
  }

  // Update current language code tag labels in the DOM
  const currentLangCode = document.getElementById("currentLangCode");
  if (currentLangCode) {
    currentLangCode.textContent = lang;
  }
  
  // Custom event so specific scripts can react to language switches
  window.dispatchEvent(new CustomEvent('langChanged', { detail: { lang } }));
}

// Initial Setup on DOM Content Loaded
document.addEventListener("DOMContentLoaded", () => {
  const activeLang = localStorage.getItem("lang") || "en";
  applyTranslations(activeLang);

  const langToggleBtn = document.getElementById("langToggleBtn");
  const langDropdown = document.getElementById("langDropdown");

  if (langToggleBtn && langDropdown) {
    // Open/Close Dropdown
    langToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      langDropdown.classList.toggle("hidden");
    });

    // Close Dropdown on outside click
    document.addEventListener("click", () => {
      langDropdown.classList.add("hidden");
    });

    // Handle Language options click
    const langOptions = langDropdown.querySelectorAll(".lang-opt");
    langOptions.forEach(opt => {
      opt.addEventListener("click", () => {
        const selectedLang = opt.getAttribute("data-lang");
        localStorage.setItem("lang", selectedLang);
        applyTranslations(selectedLang);
        langDropdown.classList.add("hidden");
      });
    });
  }
});
