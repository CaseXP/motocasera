let entrega = {
  repartidor: "Fernando",
  fechaInicio: "",
  horaInicio: "",
  ubicacionInicio: "",
  fechaFin: "",
  horaFin: "",
  ubicacionFin: "",
  comentario: "",
  fotoBase64: "",
  firmaBase64: ""
};

// 🕒 Obtener hora y fecha actuales
function obtenerFechaHora() {
  const now = new Date();
  return {
    fecha: now.toLocaleDateString(),
    hora: now.toLocaleTimeString()
  };
}

// 📍 Obtener ubicación GPS
function obtenerUbicacion(callback) {
  if (!navigator.geolocation) {
    alert("Tu navegador no soporta geolocalización");
    return;
  }
  navigator.geolocation.getCurrentPosition(pos => {
    const coords = `${pos.coords.latitude}, ${pos.coords.longitude}`;
    callback(coords);
  }, () => {
    alert("No se pudo obtener tu ubicación");
  });
}

// 📸 Convertir imagen a base64
function leerFoto(callback) {
  const archivo = document.getElementById("foto").files[0];
  if (!archivo) {
    callback("");
    return;
  }
  const lector = new FileReader();
  lector.onloadend = () => callback(lector.result);
  lector.readAsDataURL(archivo);
}

// ✍️ Capturar firma del canvas
function obtenerFirmaBase64() {
  const canvas = document.getElementById("firmaCanvas");
  return canvas.toDataURL();
}

// 🧹 Limpiar firma
function limpiarFirma() {
  const canvas = document.getElementById("firmaCanvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// ▶️ Iniciar entrega
function iniciarEntrega() {
  const { fecha, hora } = obtenerFechaHora();
  entrega.fechaInicio = fecha;
  entrega.horaInicio = hora;

  obtenerUbicacion(coords => {
    entrega.ubicacionInicio = coords;
    document.getElementById("estado").textContent = "Entrega iniciada ✔️";
  });
}

// 🛑 Finalizar entrega
function finalizarEntrega() {
  const { fecha, hora } = obtenerFechaHora();
  entrega.fechaFin = fecha;
  entrega.horaFin = hora;
  entrega.comentario = document.getElementById("comentario").value;
  entrega.firmaBase64 = obtenerFirmaBase64();

  obtenerUbicacion(coords => {
    entrega.ubicacionFin = coords;

    leerFoto(foto64 => {
      entrega.fotoBase64 = foto64;
      enviarDatos();
    });
  });
}

// 📤 Enviar datos a Google Apps Script (Google Sheets)
function enviarDatos() {
  const url = "https://script.google.com/macros/s/AKfycbyVbfcT109gl3Uft-dK9fCIH9FeeWQ0YwfaeVLGI6crfto3kN0-Ks8_0nvI5TkYBoY/exec"; // <-- reemplazá esto más adelante

  fetch(url, {
    method: "POST",
    body: JSON.stringify(entrega),
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(res => res.text())
    .then(mensaje => {
      document.getElementById("estado").textContent = "Entrega registrada con éxito ✔️";
      console.log("Servidor:", mensaje);
    })
    .catch(err => {
      alert("Error al enviar los datos");
      console.error(err);
    });
}

// ✍️ Preparar canvas de firma
window.onload = () => {
  const canvas = document.getElementById("firmaCanvas");
  const ctx = canvas.getContext("2d");
  let dibujando = false;

  canvas.addEventListener("mousedown", () => dibujando = true);
  canvas.addEventListener("mouseup", () => dibujando = false);
  canvas.addEventListener("mouseout", () => dibujando = false);
  canvas.addEventListener("mousemove", e => {
    if (!dibujando) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  });
};
