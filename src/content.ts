export type Locale = 'hy' | 'en'

export const company = {
  legalName: 'ABCN LLC',
  addressEn: '35/9 Tbilisi Highway, Yerevan, Armenia',
  addressHy: 'ք. Երևան, Թբիլիսյան խճուղի 35/9',
  email: 'info@abcn.am',
  phone: '+374 10 300022',
  team: [
    {
      nameEn: 'Robert Yeritsyan',
      nameHy: 'Ռոբերտ Երիցյան',
      roleEn: 'Co-Founder & CEO',
      roleHy: 'Համահիմնադիր, տնօրեն',
      email: 'Ryeritsyan@gmail.com',
      phone: '+374 93 653995',
    },
    {
      nameEn: 'Vahe Parsamyan',
      nameHy: 'Վահե Պարսամյան',
      roleEn: 'Company Founder',
      roleHy: 'Ընկերության հիմնադիր',
      email: 'Vparsamyan@gmail.com',
      phone: '+374 93 331656',
    },
  ],
}

export const content = {
  en: {
    nav: {
      home: 'Home', about: 'About', solutions: 'Solutions', products: 'Products',
      contact: 'Contact', project: 'Discuss a project', menu: 'Open menu',
      close: 'Close menu', label: 'Main navigation', skip: 'Skip to content',
    },
    hero: {
      eyebrow: 'ENGINEERING & ENERGY SOLUTIONS',
      title: 'Reliable connections for systems that matter.',
      body: 'ABCN brings an engineering mindset to electrical infrastructure, industrial systems and the technologies that connect them.',
      primary: 'Discuss your project', secondary: 'Explore our approach',
      note: 'Electrical engineering · Infrastructure · Technical support',
    },
    intro: {
      eyebrow: 'ABCN APPROACH',
      title: 'From a technical requirement to a clear, dependable solution.',
      body: 'We structure every engagement around the real conditions of the project: application, safety, compatibility and long-term operation.',
      link: 'More about ABCN',
    },
    directions: {
      eyebrow: 'CORE DIRECTIONS', title: 'Built around practical engineering needs',
      items: [
        { index: '01', title: 'Power distribution', text: 'Solutions for controlled, protected and reliable distribution across commercial and industrial environments.' },
        { index: '02', title: 'Control & automation', text: 'A structured approach to control, protection and the integration of connected electrical systems.' },
        { index: '03', title: 'Monitoring & metering', text: 'Clear visibility into system status, consumption and the information required for confident decisions.' },
        { index: '04', title: 'Engineering support', text: 'Technical consultation and product selection aligned with project requirements and operating conditions.' },
      ],
    },
    process: {
      eyebrow: 'HOW WE WORK', title: 'A precise path from question to implementation',
      items: [
        ['01', 'Understand', 'We clarify the project, environment and required result.'],
        ['02', 'Engineer', 'We shape the solution and align the technical components.'],
        ['03', 'Support', 'We stay involved through selection, coordination and next steps.'],
      ],
    },
    productsTeaser: {
      eyebrow: 'PRODUCT CATALOG', title: 'A growing technical catalog for informed selection.',
      body: 'Verified products will be added with clear categories, technical specifications and supporting documents. Until then, our team can help identify the right direction for your project.',
      action: 'Explore the catalog',
    },
    cta: {
      eyebrow: 'START A CONVERSATION', title: 'Tell us what your project needs.',
      body: 'Share the application, technical requirement or initial question. Our team will contact you to define the next step.',
      action: 'Contact ABCN',
    },
    about: {
      eyebrow: 'ABOUT ABCN', title: 'Engineering clarity. Responsible connections.',
      lead: 'ABCN is an Armenia-based company focused on the connection between electrical technologies, infrastructure requirements and practical project execution.',
      storyTitle: 'A company built around connection',
      story: 'The ABCN identity reflects the way we work: distinct technical components become valuable when they are connected into one considered system. Our role is to make that connection clear, appropriate and dependable.',
      principlesTitle: 'Our working principles',
      principles: [
        ['Technical responsibility', 'Recommendations begin with the actual operating requirements.'],
        ['Clear communication', 'Complex technical information is translated into understandable decisions.'],
        ['Long-term thinking', 'Compatibility, maintainability and future development are considered from the start.'],
      ],
      teamTitle: 'Leadership',
    },
    solutionsPage: {
      eyebrow: 'SOLUTIONS', title: 'Start from the challenge, not from a product list.',
      lead: 'The solution section is designed to connect a real project need with the relevant engineering direction, products and documentation.',
      noteTitle: 'Built for project-specific requirements',
      note: 'Each direction can be developed around the application, operating environment and required result, with compatible equipment and technical documentation selected for the project.',
    },
    productsPage: {
      eyebrow: 'PRODUCTS', title: 'A technical catalog designed for informed selection.',
      lead: 'Verified products will be grouped by category and supported with specifications, certificates, manuals and a direct path to request a quote.',
      status: 'Catalog content is being prepared',
      features: [
        ['Structured categories', 'Category, subcategory, series and model.'],
        ['Technical data', 'Comparable characteristics and application information.'],
        ['Documents', 'Catalogs, manuals, certificates and drawings.'],
        ['Quote request', 'Ask for availability, selection support or a commercial offer without online payment.'],
      ],
      action: 'Ask about a product',
    },
    contact: {
      eyebrow: 'CONTACT', title: 'Let’s define the right next step.',
      lead: 'Send a short description of your question or project. Our team will review it and contact you to clarify the next step.',
      formTitle: 'Project inquiry', name: 'Full name', company: 'Company', email: 'Email', phone: 'Phone',
      message: 'What can we help with?', submit: 'Send inquiry', sending: 'Sending…',
      success: 'Thank you. Your inquiry has been received.',
      error: 'The inquiry could not be sent. Please contact us by phone or email.',
      details: 'Contact details', leadership: 'Direct contacts',
    },
    footer: { line: 'Engineering connections for reliable systems.', rights: 'All rights reserved.' },
  },
  hy: {
    nav: {
      home: 'Գլխավոր', about: 'Մեր մասին', solutions: 'Լուծումներ', products: 'Ապրանքներ',
      contact: 'Կապ', project: 'Քննարկել նախագիծը', menu: 'Բացել մենյուն',
      close: 'Փակել մենյուն', label: 'Գլխավոր նավիգացիա', skip: 'Անցնել բովանդակությանը',
    },
    hero: {
      eyebrow: 'ԻՆԺԵՆԵՐԱԿԱՆ ԵՎ ԷՆԵՐԳԵՏԻԿ ԼՈՒԾՈՒՄՆԵՐ',
      title: 'Հուսալի կապ՝ կարևոր համակարգերի համար։',
      body: 'ABCN-ը ինժեներական մոտեցմամբ միավորում է էլեկտրական ենթակառուցվածքները, արդյունաբերական համակարգերն ու դրանք կապող տեխնոլոգիաները։',
      primary: 'Քննարկել նախագիծը', secondary: 'Ծանոթանալ մեր մոտեցմանը',
      note: 'Էլեկտրատեխնիկա · Ենթակառուցվածքներ · Տեխնիկական աջակցություն',
    },
    intro: {
      eyebrow: 'ABCN-Ի ՄՈՏԵՑՈՒՄԸ',
      title: 'Տեխնիկական պահանջից մինչև հստակ և հուսալի լուծում։',
      body: 'Յուրաքանչյուր աշխատանք կառուցում ենք նախագծի իրական պայմանների շուրջ՝ կիրառություն, անվտանգություն, համատեղելիություն և երկարաժամկետ շահագործում։',
      link: 'Ավելին ABCN-ի մասին',
    },
    directions: {
      eyebrow: 'ՀԻՄՆԱԿԱՆ ՈՒՂՂՈՒԹՅՈՒՆՆԵՐ', title: 'Գործնական ինժեներական խնդիրների համար',
      items: [
        { index: '01', title: 'Էլեկտրաէներգիայի բաշխում', text: 'Կառավարվող, պաշտպանված և հուսալի բաշխման լուծումներ առևտրային ու արդյունաբերական միջավայրերի համար։' },
        { index: '02', title: 'Կառավարում և ավտոմատացում', text: 'Համակարգված մոտեցում էլեկտրական համակարգերի կառավարմանը, պաշտպանությանը և ինտեգրմանը։' },
        { index: '03', title: 'Մոնիթորինգ և հաշվառում', text: 'Համակարգի վիճակի և սպառման մասին հստակ տվյալներ՝ հիմնավորված որոշումներ ընդունելու համար։' },
        { index: '04', title: 'Ինժեներական աջակցություն', text: 'Տեխնիկական խորհրդատվություն և նախագծի պահանջներին համապատասխան սարքավորումների ընտրություն։' },
      ],
    },
    process: {
      eyebrow: 'ԻՆՉՊԵՍ ԵՆՔ ԱՇԽԱՏՈՒՄ', title: 'Հստակ ճանապարհ՝ հարցից մինչև իրականացում',
      items: [
        ['01', 'Հասկանում ենք', 'Հստակեցնում ենք նախագիծը, միջավայրը և ակնկալվող արդյունքը։'],
        ['02', 'Նախագծում ենք', 'Ձևավորում ենք լուծումը և համաձայնեցնում տեխնիկական բաղադրիչները։'],
        ['03', 'Աջակցում ենք', 'Մասնակցում ենք ընտրության, համակարգման և հետագա քայլերի ընթացքում։'],
      ],
    },
    productsTeaser: {
      eyebrow: 'ԱՊՐԱՆՔՆԵՐԻ ԿԱՏԱԼՈԳ', title: 'Թարմացվող տեխնիկական կատալոգ՝ հիմնավորված ընտրության համար։',
      body: 'Հաստատված ապրանքները կավելացվեն հստակ կատեգորիաներով, տեխնիկական բնութագրերով և համապատասխան փաստաթղթերով։ Մինչ այդ մեր թիմը կօգնի ընտրել ձեր նախագծին համապատասխան ուղղությունը։',
      action: 'Ծանոթանալ կատալոգին',
    },
    cta: {
      eyebrow: 'ՍԿՍԵՆՔ ՔՆՆԱՐԿՈՒՄԸ', title: 'Պատմեք՝ ինչ է անհրաժեշտ ձեր նախագծին։',
      body: 'Ուղարկեք կիրառության ոլորտը, տեխնիկական պահանջը կամ նախնական հարցը։ Մեր թիմը կկապվի ձեզ հետ՝ հաջորդ քայլը հստակեցնելու համար։',
      action: 'Կապվել ABCN-ի հետ',
    },
    about: {
      eyebrow: 'ABCN-Ի ՄԱՍԻՆ', title: 'Ինժեներական հստակություն։ Պատասխանատու կապեր։',
      lead: 'ABCN-ը Հայաստանում գործող ընկերություն է, որը կենտրոնանում է էլեկտրական տեխնոլոգիաների, ենթակառուցվածքային պահանջների և նախագծերի գործնական իրականացման կապի վրա։',
      storyTitle: 'Կապի գաղափարի շուրջ ստեղծված ընկերություն',
      story: 'ABCN-ի ինքնությունն արտացոլում է մեր աշխատանքը․ առանձին տեխնիկական բաղադրիչները արժեք են ստեղծում, երբ միավորվում են մեկ մտածված համակարգում։ Մեր դերն այդ կապը հստակ, համապատասխան և հուսալի դարձնելն է։',
      principlesTitle: 'Մեր աշխատանքային սկզբունքները',
      principles: [
        ['Տեխնիկական պատասխանատվություն', 'Առաջարկությունները սկսվում են շահագործման իրական պահանջներից։'],
        ['Հստակ հաղորդակցություն', 'Բարդ տեխնիկական տեղեկությունը վերածվում է հասկանալի որոշումների։'],
        ['Երկարաժամկետ մտածողություն', 'Համատեղելիությունը, սպասարկումն ու զարգացումը հաշվի են առնվում սկզբից։'],
      ],
      teamTitle: 'Ղեկավարություն',
    },
    solutionsPage: {
      eyebrow: 'ԼՈՒԾՈՒՄՆԵՐ', title: 'Սկսում ենք խնդրից, ոչ թե ապրանքների ցանկից։',
      lead: 'Լուծումների բաժինը նախագծված է իրական կարիքը համապատասխան ինժեներական ուղղության, ապրանքների և փաստաթղթերի հետ կապելու համար։',
      noteTitle: 'Նախատեսված է յուրաքանչյուր նախագծի պահանջների համար',
      note: 'Յուրաքանչյուր ուղղություն ձևավորվում է կիրառության, շահագործման միջավայրի և ակնկալվող արդյունքի շուրջ՝ նախագծին համապատասխան սարքավորումներով ու տեխնիկական փաստաթղթերով։',
    },
    productsPage: {
      eyebrow: 'ԱՊՐԱՆՔՆԵՐ', title: 'Տեխնիկական կատալոգ՝ հիմնավորված ընտրության համար։',
      lead: 'Հաստատված ապրանքները կխմբավորվեն ըստ կատեգորիաների և կներկայացվեն բնութագրերով, սերտիֆիկատներով, ձեռնարկներով ու գնային առաջարկի հարցման հնարավորությամբ։',
      status: 'Կատալոգի բովանդակությունը պատրաստվում է',
      features: [
        ['Կառուցվածքային կատեգորիաներ', 'Կատեգորիա, ենթակատեգորիա, շարք և մոդել։'],
        ['Տեխնիկական տվյալներ', 'Համեմատելի բնութագրեր և կիրառման տեղեկություն։'],
        ['Փաստաթղթեր', 'Կատալոգներ, ձեռնարկներ, սերտիֆիկատներ և գծագրեր։'],
        ['Գնային առաջարկ', 'Հարցրեք առկայության, ընտրության կամ կոմերցիոն առաջարկի մասին՝ առանց օնլայն վճարման։'],
      ],
      action: 'Հարցնել ապրանքի մասին',
    },
    contact: {
      eyebrow: 'ԿԱՊ', title: 'Միասին հստակեցնենք ճիշտ հաջորդ քայլը։',
      lead: 'Ուղարկեք ձեր հարցի կամ նախագծի կարճ նկարագրությունը։ Մեր թիմը կուսումնասիրի այն և կկապվի ձեզ հետ՝ հաջորդ քայլը հստակեցնելու համար։',
      formTitle: 'Նախագծի հարցում', name: 'Անուն, ազգանուն', company: 'Ընկերություն', email: 'Էլ․ փոստ', phone: 'Հեռախոս',
      message: 'Ինչո՞վ կարող ենք օգնել', submit: 'Ուղարկել հարցումը', sending: 'Ուղարկվում է…',
      success: 'Շնորհակալություն։ Ձեր հարցումը ստացվել է։',
      error: 'Հարցումը չհաջողվեց ուղարկել։ Խնդրում ենք կապվել հեռախոսով կամ էլ․ փոստով։',
      details: 'Կոնտակտային տվյալներ', leadership: 'Ուղիղ կապ',
    },
    footer: { line: 'Ինժեներական կապեր՝ հուսալի համակարգերի համար։', rights: 'Բոլոր իրավունքները պաշտպանված են։' },
  },
} as const

export type SiteCopy = (typeof content)[Locale]
