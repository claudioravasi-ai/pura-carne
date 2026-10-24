/* Pura Carne — datos de demostración.
   Todos los pacientes y números son inventados. No guardar datos reales acá. */
window.PC_DATOS = {
  padron: {
    p1: { n: 'Ríos, María E.', dni: '••.•••.412', edad: 58, sexo: 'F', hc: 'HC 102 334', cob: '[OBRA SOCIAL]',
      relevante: [['Motivo', 'Nódulo de 14 mm en mama izquierda, CSE'], ['Imágenes', 'Ecografía y mamografía: BI-RADS 4C'], ['Antecedentes', 'Madre con cáncer de mama a los 62'], ['Tratamientos', 'Ninguno previo (sin neoadyuvancia)']] },
    p2: { n: 'Paz, Luis', dni: '••.•••.905', edad: 71, sexo: 'M', hc: 'HC 087 120', cob: '[OBRA SOCIAL]',
      relevante: [['Motivo', 'Prostatectomía radical por adenocarcinoma'], ['Laboratorio', 'PSA 11,2 ng/ml'], ['Biopsia previa', 'Adenocarcinoma acinar, Gleason 3+4'], ['Tratamientos', 'Sin hormonoterapia ni radioterapia']] },
    p3: { n: 'Ledesma, Juan', dni: '••.•••.077', edad: 45, sexo: 'M', hc: 'HC 110 902', cob: '[OBRA SOCIAL]',
      relevante: [['Motivo', 'Epigastralgia de 6 meses'], ['Endoscopía', 'Gastritis nodular antral'], ['Pregunta', '¿Helicobacter pylori? ¿Atrofia o metaplasia?'], ['Tratamientos', 'Sin erradicación previa']] },
    p4: { n: 'Ferrari, Ana', dni: '••.•••.264', edad: 39, sexo: 'F', hc: 'HC 121 455', cob: '[OBRA SOCIAL]',
      relevante: [['Motivo', 'Nódulo tiroideo derecho de 18 mm'], ['Imágenes', 'Ecografía: TI-RADS 4'], ['Laboratorio', 'TSH y T4 libre normales'], ['Pregunta', 'Categoría de Bethesda']] },
    p5: { n: 'Gómez, Raúl', dni: '••.•••.318', edad: 64, sexo: 'M', hc: 'HC 076 811', cob: '[OBRA SOCIAL]',
      relevante: [['Motivo', 'Colectomía por adenocarcinoma de sigmoides'], ['Pregunta', '¿Margen distal libre?'], ['Tratamientos', 'Sin neoadyuvancia'], ['Urgencia', 'El cirujano espera en quirófano']] },
    p6: { n: 'Sosa, Patricia', dni: '••.•••.551', edad: 52, sexo: 'F', hc: 'HC 099 640', cob: '[OBRA SOCIAL]',
      relevante: [['Motivo', 'Lesión pigmentada asimétrica de 7 mm'], ['Dermatoscopía', 'Red atípica, sospecha de melanoma'], ['Antecedentes', 'Sin melanomas previos'], ['Pregunta', 'Diagnóstico y márgenes']] },
    p7: { n: 'Benítez, Carla', dni: '••.•••.733', edad: 34, sexo: 'F', hc: 'HC 130 019', cob: '[OBRA SOCIAL]',
      relevante: [['Motivo', 'Metrorragia'], ['Imágenes', 'Ecografía: pólipo endometrial'], ['Tratamientos', 'Sin terapia hormonal'], ['Pregunta', '¿Hiperplasia o atipia?']] },
    p8: { n: 'Romero, Diego', dni: '••.•••.190', edad: 60, sexo: 'M', hc: 'HC 081 377', cob: '[OBRA SOCIAL]',
      relevante: [['Motivo', 'Lesión en cuerda vocal izquierda'], ['Antecedentes', 'Tabaquista'], ['Pregunta', '¿Displasia o carcinoma?'], ['Tratamientos', 'Ninguno previo']] }
  },

  ingresos: [
    { id: 'I26-00213', pac: 'p5', tipo: 'Intraoperatoria', material: 'Intraoperatoria · margen de colon', origen: 'Quirófano 3', hora: '10:41', estado: 'urg', frascos: 1 },
    { id: 'B26-04807', pac: 'p1', tipo: 'Biopsia', material: 'Biopsia core · mama izquierda', origen: 'Diagnóstico por imágenes', hora: '08:12', estado: 'proc', frascos: 1 },
    { id: 'Q26-01122', pac: 'p2', tipo: 'Pieza quirúrgica', material: 'Prostatectomía radical', origen: 'Urología', hora: '08:35', estado: 'macro', frascos: 2 },
    { id: 'B26-04809', pac: 'p3', tipo: 'Biopsia', material: 'Biopsia endoscópica · estómago (×3)', origen: 'Gastroenterología', hora: '09:02', estado: 'macro', frascos: 3 },
    { id: 'C26-00988', pac: 'p4', tipo: 'Citología', material: 'PAAF · tiroides', origen: 'Endocrinología', hora: '09:20', estado: 'macro', frascos: 1 },
    { id: 'B26-04811', pac: 'p6', tipo: 'Biopsia', material: 'Biopsia de piel · dorso', origen: 'Dermatología', hora: '09:48', estado: 'obs', frascos: 1 }
  ],

  tacos: [
    { id: 'A1', desc: 'Cilindros 1 y 2', resumen: '5 vidrios · 2 fragmentos', vidrios: [
      ['A1-1', 'Hematoxilina-eosina', 'Nivel 1', 'Pendiente de corte', 'he'],
      ['A1-2', 'Hematoxilina-eosina', 'Nivel 2', 'Pendiente de corte', 'he'],
      ['A1-3', 'Receptor de estrógeno', 'IHQ · clon [CLON]', 'Pedido', 'ihq'],
      ['A1-4', 'Receptor de progesterona', 'IHQ · clon [CLON]', 'Pedido', 'ihq'],
      ['A1-5', 'HER2', 'IHQ · reflejo a ISH si 2+', 'Pedido', 'ihq']] },
    { id: 'A2', desc: 'Cilindros 3 y 4', resumen: '3 vidrios · 2 fragmentos', vidrios: [
      ['A2-1', 'Hematoxilina-eosina', 'Nivel 1', 'Pendiente de corte', 'he'],
      ['A2-2', 'Ki-67', 'IHQ · zona caliente', 'Pedido', 'ihq'],
      ['A2-3', 'E-cadherina', 'IHQ · si hay dudas ductal/lobulillar', 'Opcional', 'ihq']] },
    { id: 'A3', desc: 'Cilindro 5 con calcificaciones', resumen: '2 vidrios · radiografía de la pieza', vidrios: [
      ['A3-1', 'Hematoxilina-eosina', 'Nivel 1', 'Pendiente de corte', 'he'],
      ['A3-2', 'Von Kossa', 'Especial · calcio', 'Opcional', 'esp']] }
  ],

  checklist: [
    ['tipo', 'Tipo histológico', 'H&E'], ['grado', 'Grado de Nottingham', 'H&E'], ['tam', 'Extensión en los cilindros', 'Macro + H&E'],
    ['linfo', 'Invasión linfovascular', 'H&E'], ['insitu', 'Carcinoma in situ asociado', 'H&E'], ['calc', 'Microcalcificaciones', 'Rx + H&E'],
    ['re', 'Receptor de estrógeno (%)', 'IHQ'], ['rp', 'Receptor de progesterona (%)', 'IHQ'], ['her2', 'HER2 (0 a 3+)', 'IHQ / ISH'], ['ki67', 'Ki-67 (%)', 'IHQ']
  ],

  pedidos: [
    { id: 'p1', caso: 'B26-04807', taco: 'A1', pedido: 'IHQ: RE, RP y HER2', tincion: 'Inmunohistoquímica', clase: 'ihq', quien: 'Dra. [NOMBRE]', etapa: 0, urgente: false },
    { id: 'p2', caso: 'I26-00213', taco: 'F1', pedido: 'Congelación · margen distal', tincion: 'H&E rápida', clase: 'he', quien: 'Dr. [CIRUJANO]', etapa: 1, urgente: true },
    { id: 'p3', caso: 'B26-04790', taco: 'B2', pedido: '3 niveles más profundos', tincion: 'Hematoxilina-eosina', clase: 'he', quien: 'Dra. [NOMBRE]', etapa: 1, urgente: false },
    { id: 'p4', caso: 'B26-04781', taco: 'A1', pedido: 'PAS y Giemsa', tincion: 'Especiales', clase: 'esp', quien: 'Dr. [PATÓLOGO 2]', etapa: 2, urgente: false },
    { id: 'p5', caso: 'Q26-01098', taco: 'C4', pedido: 'Repetir tinción: hematoxilina débil', tincion: 'Hematoxilina-eosina', clase: 'he', quien: 'Dr. [PATÓLOGO 2]', etapa: 3, urgente: false }
  ],

  chats: {
    p1: [
      { yo: true, autor: 'Dra. [NOMBRE]', hora: '09:40', texto: 'Cuando salga del procesador, por favor RE, RP y HER2 del A1. Si queda poco tejido, priorizá HER2.' },
      { yo: false, autor: 'Téc. [NOMBRE]', hora: '09:52', texto: 'Recibido. El taco tiene buen espesor, entran los tres y dejo un blanco de reserva.' }
    ]
  },

  criterios: [
    ['tubulos', 'Formación de túbulos escasa (<10 %)', 'H&E'],
    ['atipia', 'Atipia nuclear marcada', 'H&E'],
    ['fila', 'Células discohesivas en fila india', 'H&E'],
    ['ecad', 'Pérdida de E-cadherina', 'IHQ'],
    ['mioep', 'Células mioepiteliales conservadas (p63)', 'IHQ'],
    ['bien', 'Túbulos angulados en más del 90 %, atipia leve', 'H&E'],
    ['estroma', 'Estroma desmoplásico', 'H&E']
  ],

  diferenciales: [
    { nombre: 'Carcinoma invasor de tipo no especial (NST)',
      clave: 'Apoyan: túbulos escasos, atipia, desmoplasia. En contra: pérdida de E-cadherina, mioepiteliales presentes.',
      esenciales: 'Carcinoma invasor que no reúne los criterios de un tipo especial; el patrón especial, si lo hay, no llega al 90 %.',
      ihq: 'E-cadherina membranosa positiva; p63 y calponina sin capa alrededor de los nidos.',
      fuente: 'OMS · Tumores de mama, 5.ª ed. (2019) · grado: Nottingham (Elston-Ellis)',
      p: { tubulos: 3, atipia: 3, estroma: 2, ecad: -4, fila: -2, mioep: -4, bien: -3 } },
    { nombre: 'Carcinoma lobulillar invasor',
      clave: 'Apoyan: fila india, pérdida de E-cadherina. En contra: túbulos, cohesión celular.',
      esenciales: 'Células discohesivas, aisladas o en fila india, con escasa o nula formación de túbulos.',
      ihq: 'Pérdida o alteración de E-cadherina; p120 citoplasmático difuso.',
      fuente: 'OMS · Tumores de mama, 5.ª ed. (2019)',
      p: { fila: 4, ecad: 5, tubulos: 1, mioep: -4, bien: -3 } },
    { nombre: 'Carcinoma tubular',
      clave: 'Apoyan: túbulos angulados en más del 90 %, atipia leve. En contra: atipia marcada.',
      esenciales: 'Más del 90 % de túbulos de luz abierta, angulados, con una sola capa de células de bajo grado.',
      ihq: 'Sin células mioepiteliales (p63 negativo); RE positivo, HER2 negativo.',
      fuente: 'OMS · Tumores de mama, 5.ª ed. (2019)',
      p: { bien: 5, estroma: 1, atipia: -3, tubulos: -3, mioep: -4 } },
    { nombre: 'Adenosis esclerosante (simulador benigno)',
      clave: 'Apoyan: mioepiteliales conservadas y arquitectura lobulillar. Descarta invasión.',
      esenciales: 'Proliferación lobulocéntrica de ácinos comprimidos con capa mioepitelial conservada, sin atipia.',
      ihq: 'p63, calponina y SMMHC positivos alrededor de cada ácino.',
      fuente: 'OMS · Tumores de mama, 5.ª ed. (2019)',
      p: { mioep: 6, bien: 1, atipia: -3, ecad: -1, estroma: -1 } }
  ],

  /* Casos anteriores del servicio, ya anonimizados (sin nombre ni DNI). */
  base: [
    ['B25-11802', 'mama', 'Carcinoma invasor NST, grado 2. RE 90 %, RP 60 %, HER2 1+ (HER2-bajo). Ki-67 15 %.'],
    ['B25-10477', 'mama', 'Carcinoma lobulillar invasor clásico. E-cadherina negativa. RE 95 %, HER2 0.'],
    ['B26-00931', 'mama', 'Adenosis esclerosante con microcalcificaciones. p63 conservado. Sin atipia.'],
    ['B25-09215', 'mama', 'Carcinoma tubular. Túbulos angulados en más del 90 %. RE positivo, HER2 negativo.'],
    ['B26-02210', 'mama', 'Carcinoma invasor NST, grado 3. RE negativo, RP negativo, HER2 3+.'],
    ['B25-06620', 'mama', 'Carcinoma invasor NST, grado 1. HER2 2+ con ISH no amplificado (HER2-bajo).'],
    ['Q25-04410', 'colon', 'Adenocarcinoma de colon moderadamente diferenciado. Margen distal libre a 4 cm.'],
    ['I25-00187', 'colon', 'Intraoperatoria: margen distal positivo para adenocarcinoma. Diferido concordante.'],
    ['B25-07732', 'estómago', 'Gastritis crónica activa con Helicobacter pylori (Giemsa positivo). Sin metaplasia.'],
    ['C25-03318', 'tiroides', 'PAAF de tiroides: neoplasia folicular, Bethesda IV.'],
    ['B26-01544', 'piel', 'Melanoma de extensión superficial, Breslow 0,6 mm. Márgenes libres.']
  ],

  calidad: {
    bio: { txt: 'Biopsias', plazo: '≤7 días', enPlazo: 74, ref: '80 % · RCPath', mediana: '5,2 días', p90: '9,8 días', unidad: 'día',
      concTxt: 'Segunda opinión concordante', conc: '96 %', concRef: '[valor de referencia]', correg: '0,6 %', limite: 7,
      hist: [['1', 8], ['2', 22], ['3', 41], ['4', 55], ['5', 48], ['6', 36], ['7', 27], ['8', 19], ['9', 12], ['10+', 15]],
      etapas: [['Recepción → macroscopía', 0.4], ['Macroscopía → procesador', 0.6], ['Procesado e inclusión', 1.0], ['Corte y tinción', 0.7], ['Técnicas adicionales (IHQ)', 0.9], ['Lectura → firma del informe', 1.6]],
      conclusiones: [['El paso más lento es la lectura y firma: 1,6 días de 5,2. Repartir casos entre patólogos ganaría más que acelerar el laboratorio.', 'mal'],
        ['74 % en plazo contra 80 % de referencia: faltan unos 6 casos de cada 100. Los que pasan los 7 días casi siempre llevaron IHQ.', 'mal'],
        ['Pedir la IHQ desde la macroscopía en mama y próstata acorta el circuito sin sumar trabajo.', 'bien']] },
    piezas: { txt: 'Piezas quirúrgicas', plazo: '≤10 días', enPlazo: 82, ref: '90 % · RCPath', mediana: '7,4 días', p90: '12,1 días', unidad: 'día',
      concTxt: 'Ítems CAP completos', conc: '88 %', concRef: '100 % · CAP', correg: '0,9 %', limite: 10,
      hist: [['3', 4], ['4', 9], ['5', 17], ['6', 26], ['7', 30], ['8', 24], ['9', 15], ['10', 10], ['11', 7], ['12+', 9]],
      etapas: [['Recepción → macroscopía', 1.2], ['Fijación y tallado', 1.4], ['Procesado e inclusión', 1.1], ['Corte y tinción', 0.9], ['Técnicas adicionales (IHQ)', 1.3], ['Lectura → firma del informe', 1.5]],
      conclusiones: [['La macroscopía espera 1,2 días: las piezas grandes llegan juntas los lunes. Un segundo turno de tallado ese día ordena la semana.', 'mal'],
        ['12 % de los informes de pieza no completan todos los ítems CAP. Hacer obligatorios esos campos en el informe sinóptico lo resuelve.', 'mal'],
        ['Los tiempos de corte y tinción están en rango.', 'bien']] },
    intra: { txt: 'Intraoperatorias', plazo: '≤20 min', enPlazo: 93, ref: '90 % · CAP', mediana: '14 min', p90: '21 min', unidad: 'minuto',
      concTxt: 'Concordancia con el diferido', conc: '97,8 %', concRef: '[valor de referencia]', correg: '—', limite: 20,
      hist: [['8', 3], ['10', 9], ['12', 18], ['14', 22], ['16', 17], ['18', 11], ['20', 6], ['22', 3], ['24', 2], ['26+', 2]],
      etapas: [['Quirófano → recepción', 4], ['Tallado y congelación', 4], ['Corte y tinción rápida', 3], ['Lectura y aviso al cirujano', 3]],
      conclusiones: [['Se cumple la referencia: 93 % antes de los 20 minutos.', 'bien'],
        ['Los 4 minutos de traslado desde quirófano son un tercio del tiempo. Un circuito de entrega directa los recorta.', 'mal'],
        ['Revisar las discordancias con el diferido en el ateneo mensual.', 'bien']] },
    cito: { txt: 'Citologías y PAAF', plazo: '≤5 días', enPlazo: 86, ref: '[valor de referencia]', mediana: '3,1 días', p90: '6,0 días', unidad: 'día',
      concTxt: 'Correlación cito-histológica', conc: '91 %', concRef: '[valor de referencia]', correg: '0,4 %', limite: 5,
      hist: [['1', 14], ['2', 33], ['3', 40], ['4', 26], ['5', 15], ['6', 8], ['7', 5], ['8+', 4]],
      etapas: [['Recepción → coloración', 0.5], ['Coloración y montaje', 0.6], ['Pesquisa por técnico citólogo', 0.9], ['Lectura → firma', 1.1]],
      conclusiones: [['86 % en plazo; los atrasos se concentran en PAAF de tiroides con categoría indeterminada.', 'mal'],
        ['Cargar la categoría de Bethesda en cada informe permite medir la correlación con la cirugía.', 'bien'],
        ['La pesquisa por técnico citólogo está en rango.', 'bien']] }
  }
};
