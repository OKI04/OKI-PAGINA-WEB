// productos.js
const bodyProduct = document.querySelector(".main-products");
const tituloProductos = document.querySelector("#producto h2");

let productosCargados = [];
let carrusel = [];

export async function loadProducts() {
  try {
    const res = await fetch('/admin/products/all', {
      method: 'GET',
      credentials: 'include'
    });

    if (!res.ok) {
      const err = await res.text();
      alert('Error al cargar productos: ' + err);
      return;
    }

    const baseApiUrl = "http://localhost:3900";
    const productos = await res.json();

    productosCargados = productos.map(prod => {
      const imagenesNorm = (prod.imagenes || []).map(img => normalizarImagen(img, baseApiUrl));
      const coloresNorm = (prod.colores || []).map(color => ({
        ...color,
        imagenes: (color.imagenes || []).map(img => normalizarImagen(img, baseApiUrl)),
        publicUrl: (color.imagenes?.[0] ? normalizarImagen(color.imagenes[0], baseApiUrl).publicUrl : '')
      }));
      const estampadosNorm = (prod.estampados || []).map(estampado => ({
        ...estampado,
        imagenes: (estampado.imagenes || []).map(img => normalizarImagen(img, baseApiUrl)),
        publicUrl: (estampado.imagenes?.[0] ? normalizarImagen(estampado.imagenes[0], baseApiUrl).publicUrl : '')
      }));

      return {
        ...prod,
        imagenes: imagenesNorm,
        colores: coloresNorm,
        estampados: estampadosNorm
      };
    });

    document.querySelector('.spanLoader')?.remove();
    renderProductos(productosCargados);
    loadCarrusel();

  } catch (error) {
    console.error('Error en loadProducts:', error);
    alert('Error de conexión al cargar productos');
  }
}

function normalizarImagen(img, baseUrl) {
  const rutaLimpia = img.url.replace(/\\/g, "/");
  return {
    ...img,
    url: rutaLimpia,
    publicUrl: `${baseUrl}/${rutaLimpia}`
  };
}

async function loadCarrusel() {
  try {
    const res = await fetch('/admin/carrusel/products/carrusel', {
      method: 'GET',
      credentials: 'include'
    });

    if (!res.ok) {
      const err = await res.text();
      alert('Error al cargar carrusel: ' + err);
      return;
    }

    const data = await res.json();
    const productos = data.carruselItems[0]?.productos || [];

    carrusel = filtrarCarrusel(productosCargados, productos);
    insertarEnCarrusel(carrusel, productos);

  } catch (error) {
    console.error('Error en loadCarrusel:', error);
    alert('Error de conexión al cargar el carrusel');
  }
}

function renderProductos(productos) {
  bodyProduct.innerHTML = productos.map((p, index) => {
    const color = p.colores?.[0];
    const estampado = p.estampados?.[0];
    const general = p.imagenes || [];

    let imagenes = color?.imagenes?.length ? color.imagenes :
                   estampado?.imagenes?.length ? estampado.imagenes :
                   general;

    const imagenPrincipal = imagenes?.[1]?.publicUrl || imagenes?.[0]?.publicUrl || '';

    const imagenesRotacion = imagenes.slice(1).map(img => img.publicUrl);

    return `
      <div class="product-container">
        <div class="product-card">
          <div class="product-image">
            <img 
              src="${imagenPrincipal}" 
              alt="Vista" 
              class="main-image" 
              id="mainImage-${index}" 
              data-index="${index}" 
              data-rotacionactiva='${JSON.stringify(imagenesRotacion)}'
            />
            <button class="quick-buy" onclick='AbrirProductoComprarDesdeCarrusel(${JSON.stringify(p)})'>COMPRAR</button>
          </div>
          <div class="product-info">
            <div class="product-name">${p.nombre}</div> 
            ${renderColores(p)}
            ${renderEstampados(p)}
            <div class="product-sizes">
              ${renderTallas(p.tallas)}
            </div>
            <div class="product-price">
              Precio mayorista: <span class="price-value">$${p.precio.toLocaleString('es-CO')}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  inicializarRotacion();
  inicializarColorClick();
  inicializarEstampadoClick();
}

function renderColores(p) {
  if (!p.colores?.length) return '';
  return `
    <div class="product-colors">
      <div class="lista-colores">
        <div class="colores-container">
          ${p.colores.map((c, i) => `
            <div class="color-item ${i === 0 ? 'selected' : ''}">
              <img src="${c.publicUrl}" class="color-imagen">
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderEstampados(p) {
  if (!p.estampados?.length) return '';
  return `
    <div class="product-colors">
      <div class="lista-colores">
        <div class="colores-container">
          ${p.estampados.map((e, i) => `
            <div class="estampado-item ${(p.colores?.length === 0 && i === 0) ? 'selected' : ''}">
              <img src="${e.publicUrl}" class="estampado-imagen color-imagen">
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderTallas(tallas = {}) {
  const disponibles = Object.entries(tallas).filter(([_, cant]) => cant > 0);
  return disponibles.length
    ? disponibles.map(([t]) => `<span class="size-box">${t}</span>`).join('')
    : '<span class="size-box">No disponibles</span>';
}

function inicializarRotacion() {
  document.querySelectorAll('.main-image').forEach(img => {
    const imagenesRotacion = JSON.parse(img.dataset.rotacionactiva || "[]");
    if (!imagenesRotacion.length) return;

    let intervalId = null;
    let currentIndex = 0;

    img.addEventListener("mouseenter", () => {
      if (intervalId) return;
      currentIndex = 0;
      intervalId = setInterval(() => {
        img.src = imagenesRotacion[currentIndex];
        currentIndex = (currentIndex + 1) % imagenesRotacion.length;
      }, 1000);
    });

    img.addEventListener("mouseleave", () => {
      clearInterval(intervalId);
      intervalId = null;
      img.src = imagenesRotacion[0];
    });
  });
}

function inicializarColorClick() {
  document.querySelectorAll(".color-imagen:not(.estampado-imagen)").forEach(colorImg => {
    colorImg.addEventListener("click", e => {
      const card = e.target.closest(".product-card");
      card.querySelectorAll(".color-item, .estampado-item").forEach(i => i.classList.remove("selected"));
      e.target.parentElement.classList.add("selected");

      const mainImg = card.querySelector(".main-image");
      const index = mainImg.dataset.index;
      const producto = productosCargados[index];
      const srcPath = new URL(colorImg.src).pathname;

      const color = producto.colores.find(c => new URL(c.publicUrl, location.origin).pathname === srcPath);
      if (!color || color.imagenes.length < 2) return;

      mainImg.src = color.imagenes[1].publicUrl;
      mainImg.dataset.rotacionactiva = JSON.stringify(color.imagenes.slice(2).map(img => img.publicUrl));
      inicializarRotacion();
    });
  });
}

function inicializarEstampadoClick() {
  document.querySelectorAll(".estampado-imagen").forEach(img => {
    img.addEventListener("click", e => {
      const card = e.target.closest(".product-card");
      card.querySelectorAll(".color-item, .estampado-item").forEach(i => i.classList.remove("selected"));
      e.target.parentElement.classList.add("selected");

      const mainImg = card.querySelector(".main-image");
      const index = mainImg.dataset.index;
      const producto = productosCargados[index];
      const srcPath = new URL(img.src).pathname;

      const estampado = producto.estampados.find(est => new URL(est.publicUrl, location.origin).pathname === srcPath);
      if (!estampado || estampado.imagenes.length < 2) return;

      mainImg.src = estampado.imagenes[1].publicUrl;
      mainImg.dataset.rotacionactiva = JSON.stringify(estampado.imagenes.slice(2).map(img => img.publicUrl));
      inicializarRotacion();
    });
  });
}

// Carrusel
const carouselTrack = document.querySelector(".carousel-track");
let animationId;

function filtrarCarrusel(arrayBase, arrayFiltro) {
  const refs = arrayFiltro.map(p => p.referencia);
  return arrayBase.filter(p => refs.includes(p.referencia));
}

function insertarEnCarrusel(carrusel, filtros) {
  carouselTrack.innerHTML = "";
  const cards = [];

  carrusel.forEach(producto => {
    let imagen = '';
    for (const item of filtros) {
      if (item.referencia === producto.referencia) {
        if (item.tipo === 'colores') {
          const c = producto.colores.find(col => col.codigo === item.codigo);
          imagen = c?.imagenes?.[1]?.publicUrl || '';
        } else {
          const e = producto.estampados.find(est => est.codigo === item.codigo);
          imagen = e?.imagenes?.[1]?.publicUrl || '';
        }
      }
    }

    const card = document.createElement("div");
    card.className = "carousel-item";
    card.innerHTML = `
      <img 
        src="${imagen}" 
        alt="${producto.nombre}" 
        data-id="${producto.referencia}" 
        onclick='AbrirProductoComprarDesdeCarrusel(${JSON.stringify(producto)})'
      >
    `;
    cards.push(card);
  });

  cards.forEach(c => carouselTrack.appendChild(c));
  cards.forEach(c => carouselTrack.appendChild(c.cloneNode(true)));

  carouselTrack.style.transition = "none";
  startAutoScroll(cards.length);
}

function startAutoScroll(originalItemCount) {
  cancelAnimationFrame(animationId);
  const items = document.querySelectorAll(".carousel-item");
  if (!items.length) return;

  const itemWidth = items[0].offsetWidth;
  const spacing = parseInt(getComputedStyle(items[0]).marginRight || 0);
  const loopWidth = (itemWidth + spacing) * originalItemCount;

  const speed = 3.5;
  let offset = 0;

  function step() {
    offset += speed;
    if (offset >= loopWidth) offset -= loopWidth;
    carouselTrack.style.transform = `translateX(-${offset}px)`;
    animationId = requestAnimationFrame(step);
  }

  animationId = requestAnimationFrame(step);
}

// Filtros por categoría
document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  document.querySelectorAll(".btn-categoria").forEach(boton => {
    boton.addEventListener("click", e => {
      const categoria = e.target.dataset.categoria;
      if (categoria !== "todos") {
        const filtrados = productosCargados.filter(p => p.categoria.toLowerCase() === categoria.toLowerCase());
        renderProductos(filtrados);
        tituloProductos.textContent = e.target.textContent.trim().toUpperCase();
      } else {
        renderProductos(productosCargados);
        tituloProductos.textContent = "TODOS LOS PRODUCTOS";
      }
    });
  });
});

// === EXPONER VARIABLES GLOBALES ===
window.productosCargados = productosCargados;