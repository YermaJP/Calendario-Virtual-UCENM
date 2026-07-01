// ============================================================
// UCENM — Datos de ejemplo
// Se cargan automáticamente la primera vez que se abre la app
// ============================================================
(function () {
  // Calculamos fechas relativas a hoy
  function fechaRel(diasDelta) {
    var d = new Date();
    d.setDate(d.getDate() + diasDelta);
    return d.toISOString().split("T")[0];
  }

  window.UCENM_DATOS_EJEMPLO = {
    clases: [
      {
        id: "cls_001",
        fecha: fechaRel(0),
        horaInicio: "08:00",
        horaFin: "10:00",
        tema: "Introducción a los algoritmos",
        descripcion: "Conceptos fundamentales: qué es un algoritmo, características y ejemplos cotidianos.",
        tipo: "regular",
        color: "azul",
      },
      {
        id: "cls_002",
        fecha: fechaRel(2),
        horaInicio: "08:00",
        horaFin: "10:00",
        tema: "Variables y tipos de datos",
        descripcion: "Declaración de variables, tipos primitivos (entero, flotante, cadena, booleano) y buenas prácticas de nomenclatura.",
        tipo: "regular",
        color: "azul",
      },
      {
        id: "cls_003",
        fecha: fechaRel(4),
        horaInicio: "08:00",
        horaFin: "10:00",
        tema: "Estructuras condicionales",
        descripcion: "Sentencias if, else if, else y switch. Operadores de comparación y lógicos.",
        tipo: "regular",
        color: "azul",
      },
      {
        id: "cls_004",
        fecha: fechaRel(7),
        horaInicio: "08:00",
        horaFin: "10:00",
        tema: "Ciclos: for y while",
        descripcion: "Iteración con ciclos controlados por contador y condición. Ciclos anidados.",
        tipo: "regular",
        color: "azul",
      },
      {
        id: "cls_005",
        fecha: fechaRel(9),
        horaInicio: "08:00",
        horaFin: "10:00",
        tema: "Funciones y procedimientos",
        descripcion: "Definición, parámetros, retorno de valores. Alcance de variables (scope).",
        tipo: "regular",
        color: "azul",
      },
      {
        id: "cls_006",
        fecha: fechaRel(11),
        horaInicio: "08:00",
        horaFin: "10:00",
        tema: "Arreglos y listas",
        descripcion: "Declaración, acceso por índice, recorrido con ciclos. Operaciones básicas sobre arreglos.",
        tipo: "regular",
        color: "azul",
      },
      {
        id: "cls_007",
        fecha: fechaRel(3),
        horaInicio: "10:00",
        horaFin: "11:00",
        tema: "Tutoría: Resolución de dudas Unidad 1",
        descripcion: "Sesión de consultas sobre los temas de la primera unidad. Traiga sus preguntas preparadas.",
        tipo: "extraordinaria",
        color: "verde",
      },
    ],
    tareas: [
      {
        id: "tar_001",
        titulo: "Diagrama de flujo: algoritmo cotidiano",
        materia: "Introducción a la Programación",
        fechaEntrega: fechaRel(5),
        descripcion: "Elija un proceso de su vida diaria (preparar café, lavarse los dientes, etc.) y represéntelo como diagrama de flujo usando los símbolos estándar. Entregue en formato PDF.",
        linkMaterial: "https://drive.google.com/",
        estado: "pendiente",
      },
      {
        id: "tar_002",
        titulo: "Ejercicios: Variables y condicionales",
        materia: "Introducción a la Programación",
        fechaEntrega: fechaRel(10),
        descripcion: "Resuelva los 10 ejercicios del documento adjunto. Para cada ejercicio escriba el pseudocódigo y el código en Python. Suba su trabajo al PTA.",
        linkMaterial: "https://drive.google.com/",
        estado: "pendiente",
      },
      {
        id: "tar_003",
        titulo: "Proyecto Parcial: Mini calculadora",
        materia: "Introducción a la Programación",
        fechaEntrega: fechaRel(18),
        descripcion: "Desarrolle una calculadora simple en Python que realice las 4 operaciones básicas usando funciones. El programa debe validar entradas y manejar la división por cero. Incluya comentarios en el código.",
        linkMaterial: "",
        estado: "pendiente",
      },
    ],
    anuncios: [
      {
        id: "ann_001",
        titulo: "Bienvenidos al I Período 2026",
        cuerpo: "Estimados estudiantes, les doy la bienvenida al nuevo período académico. El material de la primera unidad ya está disponible en el PVA. Recuerden revisar el calendario de clases y las fechas de entrega de tareas. Cualquier consulta pueden escribirme al correo institucional o contactarme por WhatsApp en el horario de atención: lunes a viernes 7:00 AM – 5:00 PM.",
        fecha: fechaRel(-2),
        link: "",
      },
      {
        id: "ann_002",
        titulo: "Cambio de salón — Clase del " + new Date(Date.now() + 4 * 86400000).toLocaleDateString("es-HN", { weekday: "long", day: "numeric", month: "long" }),
        cuerpo: "Por mantenimiento en el edificio A, la clase del próximo jueves se traslada al Laboratorio de Cómputo 2 (edificio C, primer piso). El horario se mantiene igual. Por favor lleguen puntuales ya que la sala tiene capacidad limitada.",
        fecha: fechaRel(-1),
        link: "",
      },
    ],
  };
})();
