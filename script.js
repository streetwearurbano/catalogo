// ==========================================
// SUPABASE
// ==========================================

const SUPABASE_URL = "https://vxaaqvdizewthswnczyo.supabase.co";
const SUPABASE_KEY = "sb_publishable_yOk2GHKWL-CMb_HKOil2IQ_--bUiqVy";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


// ==========================================
// ELEMENTOS
// ==========================================

const productosContenedor = document.getElementById("productos");
const tituloProductos = document.querySelector(".titulo-productos");

const abrirMenu = document.getElementById("abrirMenu");
const cerrarMenu = document.getElementById("cerrarMenu");
const menuLateral = document.getElementById("menuLateral");
const fondoMenu = document.getElementById("fondoMenu");
const enlacesCategorias = document.querySelectorAll(".categorias a");

const abrirCarrito = document.getElementById("abrirCarrito");
const cerrarCarrito = document.getElementById("cerrarCarrito");
const panelCarrito = document.getElementById("panelCarrito");
const fondoCarrito = document.getElementById("fondoCarrito");
const cantidadCarrito = document.getElementById("cantidadCarrito");
const productosCarrito = document.getElementById("productosCarrito");
const totalCarrito = document.getElementById("totalCarrito");
const finalizarCompra = document.getElementById("finalizarCompra");
const notificacion = document.getElementById("notificacion");
const fondoModalProducto = document.getElementById("fondoModalProducto");
const modalProducto = document.getElementById("modalProducto");
const botonCerrarModalProducto = document.getElementById("botonCerrarModalProducto");
const modalImagenPrincipal = document.getElementById("modalImagenPrincipal");
const miniaturasModal = document.getElementById("miniaturasModal");
const modalNombreProducto = document.getElementById("modalNombreProducto");
const modalPrecioProducto = document.getElementById("modalPrecioProducto");
const modalTituloTalles = document.getElementById("modalTituloTalles");
const modalBotonesTalles = document.getElementById("modalBotonesTalles");
const modalAgregarCarrito = document.getElementById("modalAgregarCarrito");
const modalAnterior = document.getElementById("modalAnterior");
const modalSiguiente = document.getElementById("modalSiguiente");


// ==========================================
// ESTADO
// ==========================================

let productos = [];
let categoriaActual = "todos";
let carrito = cargarCarritoGuardado();
let productoModalActual = null;
let indiceImagenModal = 0;
let talleModalSeleccionado = "";


// ==========================================
// UTILIDADES
// ==========================================

function escaparHTML(valor) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatearPrecio(precio) {
    return Number(precio || 0).toLocaleString("es-AR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}

function obtenerImagenes(producto) {
    if (Array.isArray(producto.imagenes_url) && producto.imagenes_url.length > 0) {
        return producto.imagenes_url.filter(Boolean);
    }

    if (producto.imagen_url) {
        return [producto.imagen_url];
    }

    return ["logo.jpeg"];
}

function obtenerTalles(producto) {
    return String(producto.talles || "")
        .split(",")
        .map(talle => talle.trim())
        .filter(Boolean);
}

function mostrarNotificacion(texto) {
    notificacion.textContent = texto;
    notificacion.classList.add("activa");

    clearTimeout(mostrarNotificacion.timeout);
    mostrarNotificacion.timeout = setTimeout(() => {
        notificacion.classList.remove("activa");
    }, 2200);
}


// ==========================================
// PRODUCTOS
// ==========================================

async function cargarProductos() {
    productosContenedor.innerHTML = '<p id="cargandoProductos">Cargando productos...</p>';

    const { data, error } = await supabaseClient
        .from("productos")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);
        productosContenedor.innerHTML = "<p>No se pudieron cargar los productos.</p>";
        return;
    }

    productos = data || [];
    renderProductos();
}

function renderProductos() {
 let lista = productos;

if (categoriaActual === "todos") {
    lista = productos.filter(producto => producto.destacado === true);
} else {
    lista = productos.filter(producto => producto.categoria === categoriaActual);
}

    productosContenedor.innerHTML = "";

    if (categoriaActual === "todos") {
        tituloProductos.textContent = "DESTACADOS";
    } else {
        const enlace = Array.from(enlacesCategorias).find(
            item => item.dataset.categoria === categoriaActual
        );
        tituloProductos.textContent = enlace ? enlace.textContent.trim() : categoriaActual.toUpperCase();
    }

    if (lista.length === 0) {
        productosContenedor.innerHTML = "<p>No hay productos en esta categoría.</p>";
        return;
    }

    lista.forEach(producto => {
        productosContenedor.appendChild(crearTarjetaProducto(producto));
    });
}

function crearTarjetaProducto(producto) {
    const imagenes = obtenerImagenes(producto);
    const talles = obtenerTalles(producto);

    const tarjeta = document.createElement("article");
    tarjeta.className = "producto";
    tarjeta.dataset.categoria = producto.categoria || "";

    const contenedorImagen = document.createElement("div");
    contenedorImagen.className = "contenedor-imagen galeria-producto";

    const imagen = document.createElement("img");
    imagen.src = imagenes[0];
    imagen.alt = producto.nombre || "Producto";
    imagen.loading = "lazy";
    contenedorImagen.appendChild(imagen);

    let indiceImagen = 0;
    contenedorImagen.addEventListener("click", () => {
    abrirModalProductoDetalle(producto, indiceImagen);
});

    if (producto.destacado) {
        const etiqueta = document.createElement("span");
        etiqueta.className = "etiqueta-destacado";
        etiqueta.textContent = "DESTACADO";
        contenedorImagen.appendChild(etiqueta);
    }

    if (imagenes.length > 1) {
        const anterior = document.createElement("button");
        anterior.type = "button";
        anterior.className = "flecha-galeria flecha-anterior";
        anterior.setAttribute("aria-label", "Foto anterior");
        anterior.textContent = "‹";

        const siguiente = document.createElement("button");
        siguiente.type = "button";
        siguiente.className = "flecha-galeria flecha-siguiente";
        siguiente.setAttribute("aria-label", "Foto siguiente");
        siguiente.textContent = "›";

        const contador = document.createElement("span");
        contador.className = "contador-galeria";
        contador.textContent = `1 / ${imagenes.length}`;

        const puntos = document.createElement("div");
        puntos.className = "puntos-galeria";

        const actualizarGaleria = () => {
            imagen.src = imagenes[indiceImagen];
            contador.textContent = `${indiceImagen + 1} / ${imagenes.length}`;

            puntos.querySelectorAll("button").forEach((punto, i) => {
                punto.classList.toggle("activo", i === indiceImagen);
            });
        };

        imagenes.forEach((_, i) => {
            const punto = document.createElement("button");
            punto.type = "button";
            punto.className = "punto-galeria";
            punto.setAttribute("aria-label", `Ver foto ${i + 1}`);
            if (i === 0) punto.classList.add("activo");

            punto.addEventListener("click", (e) => {
                e.stopPropagation();
                indiceImagen = i;
                actualizarGaleria();
            });

            puntos.appendChild(punto);
        });

        anterior.addEventListener("click", (e) => {
            e.stopPropagation();
            indiceImagen = (indiceImagen - 1 + imagenes.length) % imagenes.length;
            actualizarGaleria();
        });

        siguiente.addEventListener("click", (e) => {
            e.stopPropagation();
            indiceImagen = (indiceImagen + 1) % imagenes.length;
            actualizarGaleria();
        });

        contenedorImagen.appendChild(anterior);
        contenedorImagen.appendChild(siguiente);
        contenedorImagen.appendChild(contador);
        contenedorImagen.appendChild(puntos);
    }

    const titulo = document.createElement("h2");
    titulo.textContent = producto.nombre || "Producto";

    const precio = document.createElement("p");
    precio.className = "precio";
    precio.textContent = `$${formatearPrecio(producto.precio)}`;

    const zonaTalles = document.createElement("div");
    zonaTalles.className = "zona-talles";

    const tituloTalles = document.createElement("p");
    tituloTalles.className = "titulo-talles";
    tituloTalles.textContent = talles.length ? "Seleccioná un talle" : "Talles: consultar";
    zonaTalles.appendChild(tituloTalles);

    const botonesTalles = document.createElement("div");
    botonesTalles.className = "botones-talles";
    zonaTalles.appendChild(botonesTalles);

    let talleSeleccionado = "";

    talles.forEach(talle => {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "boton-talle";
        boton.textContent = talle;

        boton.addEventListener("click", () => {
            talleSeleccionado = talle;

            botonesTalles.querySelectorAll(".boton-talle").forEach(item => {
                item.classList.remove("seleccionado");
            });

            boton.classList.add("seleccionado");
        });

        botonesTalles.appendChild(boton);
    });

    const botonAgregar = document.createElement("button");
    botonAgregar.type = "button";
    botonAgregar.className = "agregar-carrito";
    botonAgregar.textContent = "AGREGAR AL CARRITO";

    botonAgregar.addEventListener("click", () => {
        if (talles.length > 0 && !talleSeleccionado) {
            mostrarNotificacion("Seleccioná un talle");
            return;
        }

        agregarAlCarrito({
            id: producto.id,
            nombre: producto.nombre,
            precio: Number(producto.precio),
            imagen: imagenes[0],
            talle: talleSeleccionado || "Consultar"
        });
    });

    tarjeta.appendChild(contenedorImagen);
    tarjeta.appendChild(titulo);
    tarjeta.appendChild(precio);
    tarjeta.appendChild(zonaTalles);
    tarjeta.appendChild(botonAgregar);

    return tarjeta;
}
function actualizarImagenModal() {
    if (!productoModalActual) return;

    const imagenes = obtenerImagenes(productoModalActual);

    modalImagenPrincipal.src = imagenes[indiceImagenModal];
    modalImagenPrincipal.alt = productoModalActual.nombre || "Producto";

    modalAnterior.style.display = imagenes.length > 1 ? "flex" : "none";
    modalSiguiente.style.display = imagenes.length > 1 ? "flex" : "none";

    miniaturasModal.querySelectorAll(".miniatura-modal").forEach((miniatura, i) => {
        miniatura.classList.toggle("activa", i === indiceImagenModal);
    });
}

function abrirModalProductoDetalle(producto, indiceInicial = 0) {
    productoModalActual = producto;
    indiceImagenModal = indiceInicial;
    talleModalSeleccionado = "";

    const imagenes = obtenerImagenes(producto);
    const talles = obtenerTalles(producto);

    modalNombreProducto.textContent = producto.nombre || "Producto";
    modalPrecioProducto.textContent = `$${formatearPrecio(producto.precio)}`;

    modalTituloTalles.textContent = talles.length
        ? "Seleccioná un talle"
        : "Talles: consultar";

    modalBotonesTalles.innerHTML = "";

    if (talles.length > 0) {
        talles.forEach(talle => {
            const boton = document.createElement("button");
            boton.type = "button";
            boton.className = "modal-boton-talle";
            boton.textContent = talle;

            boton.addEventListener("click", () => {
                talleModalSeleccionado = talle;

                modalBotonesTalles.querySelectorAll(".modal-boton-talle").forEach(item => {
                    item.classList.remove("seleccionado");
                });

                boton.classList.add("seleccionado");
            });

            modalBotonesTalles.appendChild(boton);
        });
    } else {
        const texto = document.createElement("p");
        texto.className = "modal-sin-talles";
        texto.textContent = "Consultanos por talles disponibles.";
        modalBotonesTalles.appendChild(texto);
    }

    miniaturasModal.innerHTML = "";

    imagenes.forEach((url, i) => {
        const botonMiniatura = document.createElement("button");
        botonMiniatura.type = "button";
        botonMiniatura.className = "miniatura-modal";
        botonMiniatura.innerHTML = `<img src="${escaparHTML(url)}" alt="Miniatura ${i + 1}">`;

        botonMiniatura.addEventListener("click", () => {
            indiceImagenModal = i;
            actualizarImagenModal();
        });

        miniaturasModal.appendChild(botonMiniatura);
    });

    modalAgregarCarrito.onclick = () => {
        if (talles.length > 0 && !talleModalSeleccionado) {
            mostrarNotificacion("Seleccioná un talle");
            return;
        }

        agregarAlCarrito({
            id: producto.id,
            nombre: producto.nombre,
            precio: Number(producto.precio),
            imagen: imagenes[0],
            talle: talleModalSeleccionado || "Consultar"
        });

        cerrarModalProductoDetalle();
    };

    actualizarImagenModal();

    fondoModalProducto.classList.add("activo");
    modalProducto.classList.add("activo");
    document.body.style.overflow = "hidden";
}

function cerrarModalProductoDetalle() {
    fondoModalProducto.classList.remove("activo");
    modalProducto.classList.remove("activo");
    document.body.style.overflow = "";
}

botonCerrarModalProducto.addEventListener("click", cerrarModalProductoDetalle);
fondoModalProducto.addEventListener("click", cerrarModalProductoDetalle);

modalAnterior.addEventListener("click", () => {
    if (!productoModalActual) return;

    const imagenes = obtenerImagenes(productoModalActual);
    indiceImagenModal = (indiceImagenModal - 1 + imagenes.length) % imagenes.length;
    actualizarImagenModal();
});

modalSiguiente.addEventListener("click", () => {
    if (!productoModalActual) return;

    const imagenes = obtenerImagenes(productoModalActual);
    indiceImagenModal = (indiceImagenModal + 1) % imagenes.length;
    actualizarImagenModal();
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        cerrarModalProductoDetalle();
    }
});

// ==========================================
// MENÚ
// ==========================================

function abrirMenuLateral() {
    menuLateral.classList.add("activo");
    fondoMenu.classList.add("activo");
}

function cerrarMenuLateral() {
    menuLateral.classList.remove("activo");
    fondoMenu.classList.remove("activo");
}

abrirMenu.addEventListener("click", abrirMenuLateral);
cerrarMenu.addEventListener("click", cerrarMenuLateral);
fondoMenu.addEventListener("click", cerrarMenuLateral);

enlacesCategorias.forEach(enlace => {
    enlace.addEventListener("click", (e) => {
        e.preventDefault();
        categoriaActual = enlace.dataset.categoria || "todos";
        cerrarMenuLateral();
        renderProductos();
        document.querySelector("main").scrollIntoView({ behavior: "smooth" });
    });
});


// ==========================================
// CARRITO
// ==========================================

function cargarCarritoGuardado() {
    try {
        return JSON.parse(localStorage.getItem("carritoStreetwear")) || [];
    } catch {
        return [];
    }
}

function guardarCarrito() {
    localStorage.setItem("carritoStreetwear", JSON.stringify(carrito));
}

function agregarAlCarrito(producto) {
    const existente = carrito.find(item =>
        item.id === producto.id && item.talle === producto.talle
    );

    if (existente) {
        existente.cantidad += 1;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }

    guardarCarrito();
    renderCarrito();
    mostrarNotificacion("Producto agregado al carrito");
}

function cambiarCantidad(indice, cambio) {
    carrito[indice].cantidad += cambio;

    if (carrito[indice].cantidad <= 0) {
        carrito.splice(indice, 1);
    }

    guardarCarrito();
    renderCarrito();
}

function eliminarDelCarrito(indice) {
    carrito.splice(indice, 1);
    guardarCarrito();
    renderCarrito();
}

function renderCarrito() {
    const cantidadTotal = carrito.reduce((total, item) => total + item.cantidad, 0);
    const precioTotal = carrito.reduce(
        (total, item) => total + Number(item.precio) * item.cantidad,
        0
    );

    cantidadCarrito.textContent = cantidadTotal;
    totalCarrito.textContent = `$${formatearPrecio(precioTotal)}`;
    productosCarrito.innerHTML = "";

    if (carrito.length === 0) {
        productosCarrito.innerHTML = '<p class="carrito-vacio">Tu carrito está vacío.</p>';
        return;
    }

    carrito.forEach((item, indice) => {
        const elemento = document.createElement("div");
        elemento.className = "producto-carrito";

        elemento.innerHTML = `
            <div class="producto-carrito-contenido">
                <img class="imagen-carrito" src="${escaparHTML(item.imagen || "logo.jpeg")}" alt="${escaparHTML(item.nombre)}">

                <div class="producto-carrito-info">
                    <strong>${escaparHTML(item.nombre)}</strong>
                    <span>Talle: ${escaparHTML(item.talle)}</span>
                    <span>$${formatearPrecio(item.precio)} c/u</span>
                </div>
            </div>

            <div class="controles-cantidad">
                <button type="button" class="restar-cantidad">−</button>
                <span>${item.cantidad}</span>
                <button type="button" class="sumar-cantidad">+</button>
            </div>

            <button type="button" class="eliminar-carrito">Eliminar</button>
        `;

        elemento.querySelector(".restar-cantidad").addEventListener("click", () => {
            cambiarCantidad(indice, -1);
        });

        elemento.querySelector(".sumar-cantidad").addEventListener("click", () => {
            cambiarCantidad(indice, 1);
        });

        elemento.querySelector(".eliminar-carrito").addEventListener("click", () => {
            eliminarDelCarrito(indice);
        });

        productosCarrito.appendChild(elemento);
    });
}

function abrirPanelCarrito() {
    panelCarrito.classList.add("activo");
    fondoCarrito.classList.add("activo");
}

function cerrarPanelCarrito() {
    panelCarrito.classList.remove("activo");
    fondoCarrito.classList.remove("activo");
}

abrirCarrito.addEventListener("click", abrirPanelCarrito);
cerrarCarrito.addEventListener("click", cerrarPanelCarrito);
fondoCarrito.addEventListener("click", cerrarPanelCarrito);

finalizarCompra.addEventListener("click", () => {
    if (carrito.length === 0) {
        mostrarNotificacion("Tu carrito está vacío");
        return;
    }

    const total = carrito.reduce(
        (suma, item) => suma + Number(item.precio) * item.cantidad,
        0
    );

    const lineas = carrito.map(item => {
        const subtotal = Number(item.precio) * item.cantidad;
        return `▪️ ${item.nombre} - Talle: ${item.talle} - Cantidad: ${item.cantidad} - $${formatearPrecio(subtotal)}`;
    });

    const mensaje = [
        "¡Hola! Quiero confirmar este pedido desde la web:",
        "",
        ...lineas,
        "",
        `*TOTAL: $${formatearPrecio(total)}*`,
        "",
        "¿Me confirman stock?"
    ].join("\n");

  const numero = "5493704991434";
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`, "_blank");
});


// ==========================================
// INICIAR
// ==========================================

renderCarrito();
cargarProductos();
