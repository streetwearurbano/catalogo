// ==========================================
// SUPABASE
// ==========================================

const SUPABASE_URL = "https://vxaaqvdizewthswnczyo.supabase.co";
const SUPABASE_KEY = "sb_publishable_yOk2GHKWL-CMb_HKOil2IQ_--bUiqVy";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ==========================================
// WHATSAPP
// ==========================================

const NUMERO_WHATSAPP = "5493705026329";


// ==========================================
// ELEMENTOS
// ==========================================

const abrirMenu = document.getElementById("abrirMenu");
const cerrarMenu = document.getElementById("cerrarMenu");
const menuLateral = document.getElementById("menuLateral");
const fondoMenu = document.getElementById("fondoMenu");

const contenedorProductos = document.getElementById("productos");
const cargandoProductos = document.getElementById("cargandoProductos");

const abrirCarrito = document.getElementById("abrirCarrito");
const cerrarCarrito = document.getElementById("cerrarCarrito");
const panelCarrito = document.getElementById("panelCarrito");
const fondoCarrito = document.getElementById("fondoCarrito");

const cantidadCarrito = document.getElementById("cantidadCarrito");
const productosCarrito = document.getElementById("productosCarrito");
const totalCarrito = document.getElementById("totalCarrito");

const finalizarCompra = document.getElementById("finalizarCompra");
const notificacion = document.getElementById("notificacion");


// ==========================================
// CARRITO
// ==========================================

let carrito = [];

try {

    carrito =
        JSON.parse(
            localStorage.getItem("carritoStreetwear")
        ) || [];

} catch (error) {

    carrito = [];
}


// ==========================================
// MENÚ
// ==========================================

abrirMenu.addEventListener("click", () => {

    menuLateral.classList.add("activo");
    fondoMenu.classList.add("activo");

    document.body.style.overflow = "hidden";
});


function cerrarMenuLateral() {

    menuLateral.classList.remove("activo");
    fondoMenu.classList.remove("activo");

    document.body.style.overflow = "";
}


cerrarMenu.addEventListener(
    "click",
    cerrarMenuLateral
);

fondoMenu.addEventListener(
    "click",
    cerrarMenuLateral
);


// ==========================================
// ABRIR / CERRAR CARRITO
// ==========================================

function mostrarCarrito() {

    panelCarrito.classList.add("activo");
    fondoCarrito.classList.add("activo");

    document.body.style.overflow = "hidden";
}


function ocultarCarrito() {

    panelCarrito.classList.remove("activo");
    fondoCarrito.classList.remove("activo");

    document.body.style.overflow = "";
}


abrirCarrito.addEventListener(
    "click",
    mostrarCarrito
);


cerrarCarrito.addEventListener(
    "click",
    ocultarCarrito
);


fondoCarrito.addEventListener(
    "click",
    ocultarCarrito
);


// ==========================================
// CARGAR PRODUCTOS
// ==========================================

async function cargarProductosSupabase() {

    const { data: productos, error } =
        await supabaseClient
            .from("productos")
            .select("*")
            .order(
                "created_at",
                { ascending: false }
            );


    if (cargandoProductos) {
        cargandoProductos.remove();
    }


    if (error) {

        console.error(error);

        contenedorProductos.innerHTML =
            "<p>No se pudieron cargar los productos.</p>";

        return;
    }


    contenedorProductos.innerHTML = "";


    if (!productos || productos.length === 0) {

        contenedorProductos.innerHTML =
            "<p>No hay productos disponibles.</p>";

        return;
    }


    productos.forEach(producto => {

        crearProducto(producto);

    });


    activarFiltros();
}


// ==========================================
// CREAR PRODUCTO
// ==========================================

function crearProducto(producto) {

    const tarjeta =
        document.createElement("article");

    tarjeta.className = "producto";

    tarjeta.dataset.categoria =
        producto.categoria;


    // ======================================
    // IMAGEN
    // ======================================

    const contenedorImagen =
        document.createElement("div");

    contenedorImagen.className =
        "contenedor-imagen";


    const imagen =
        document.createElement("img");

    imagen.src =
        producto.imagen_url;

    imagen.alt =
        producto.nombre;

    imagen.loading =
        "lazy";


    contenedorImagen.appendChild(imagen);


    // ======================================
    // DESTACADO
    // ======================================

    if (producto.destacado) {

        const etiqueta =
            document.createElement("span");

        etiqueta.className =
            "etiqueta-destacado";

        etiqueta.textContent =
            "DESTACADO";

        contenedorImagen.appendChild(
            etiqueta
        );
    }


    // ======================================
    // NOMBRE
    // ======================================

    const nombre =
        document.createElement("h2");

    nombre.textContent =
        producto.nombre;


    // ======================================
    // PRECIO
    // ======================================

    const precio =
        document.createElement("p");

    precio.className =
        "precio";

    precio.textContent =
        `$ ${formatearPrecio(producto.precio)}`;


    // ======================================
    // TALLES
    // ======================================

    const zonaTalles =
        document.createElement("div");

    zonaTalles.className =
        "zona-talles";


    const textoTalle =
        document.createElement("p");

    textoTalle.className =
        "titulo-talles";

    textoTalle.textContent =
        "Seleccioná tu talle";


    const botonesTalles =
        document.createElement("div");

    botonesTalles.className =
        "botones-talles";


    let talleSeleccionado = null;


    const talles =
        String(producto.talles || "")
            .split(",")
            .map(talle => talle.trim())
            .filter(talle => talle !== "");


    talles.forEach(talle => {

        const boton =
            document.createElement("button");

        boton.type =
            "button";

        boton.className =
            "boton-talle";

        boton.textContent =
            talle;


        boton.addEventListener(
            "click",
            () => {

                talleSeleccionado =
                    talle;


                botonesTalles
                    .querySelectorAll(".boton-talle")
                    .forEach(b => {

                        b.classList.remove(
                            "seleccionado"
                        );

                    });


                boton.classList.add(
                    "seleccionado"
                );
            }
        );


        botonesTalles.appendChild(
            boton
        );
    });


    zonaTalles.appendChild(
        textoTalle
    );

    zonaTalles.appendChild(
        botonesTalles
    );


    // ======================================
    // BOTÓN AGREGAR
    // ======================================

    const botonAgregar =
        document.createElement("button");

    botonAgregar.type =
        "button";

    botonAgregar.className =
        "agregar-carrito";

    botonAgregar.textContent =
        "AGREGAR AL CARRITO";


    botonAgregar.addEventListener(
        "click",
        () => {

            if (!talleSeleccionado) {

                mostrarNotificacion(
                    "Seleccioná un talle"
                );

                return;
            }


            agregarAlCarrito(
                producto,
                talleSeleccionado
            );


            mostrarNotificacion(
                `${producto.nombre} agregado al carrito`
            );
        }
    );


    // ======================================
    // ARMAR TARJETA
    // ======================================

    tarjeta.appendChild(
        contenedorImagen
    );

    tarjeta.appendChild(
        nombre
    );

    tarjeta.appendChild(
        precio
    );

    tarjeta.appendChild(
        zonaTalles
    );

    tarjeta.appendChild(
        botonAgregar
    );


    contenedorProductos.appendChild(
        tarjeta
    );
}


// ==========================================
// AGREGAR AL CARRITO
// ==========================================

function agregarAlCarrito(producto, talle) {

    const existente =
        carrito.find(item =>

            item.id === producto.id &&
            item.talle === talle

        );


    if (existente) {

        existente.cantidad++;

    } else {

        carrito.push({

            id: producto.id,

            nombre: producto.nombre,

            precio: Number(producto.precio),

            imagen: producto.imagen_url,

            talle: talle,

            cantidad: 1

        });
    }


    guardarCarrito();

    actualizarCarrito();
}


// ==========================================
// GUARDAR CARRITO
// ==========================================

function guardarCarrito() {

    localStorage.setItem(
        "carritoStreetwear",
        JSON.stringify(carrito)
    );
}


// ==========================================
// ACTUALIZAR CARRITO
// ==========================================

function actualizarCarrito() {

    productosCarrito.innerHTML = "";


    // ======================================
    // CONTADOR
    // ======================================

    const cantidadTotal =
        carrito.reduce(
            (total, item) =>
                total + item.cantidad,
            0
        );


    cantidadCarrito.textContent =
        cantidadTotal;


    // ======================================
    // CARRITO VACÍO
    // ======================================

    if (carrito.length === 0) {

        productosCarrito.innerHTML =
            `
            <p class="carrito-vacio">
                Tu carrito está vacío.
            </p>
            `;

        totalCarrito.textContent =
            "$ 0";

        return;
    }


    // ======================================
    // PRODUCTOS
    // ======================================

    carrito.forEach((item, indice) => {

        const producto =
            document.createElement("div");

        producto.className =
            "producto-carrito";


        producto.innerHTML = `

            <img
                src="${item.imagen}"
                alt=""
            >

            <div class="info-carrito">

                <h3></h3>

                <p class="talle-carrito"></p>

                <p class="precio-carrito"></p>

                <div class="controles-cantidad">

                    <button
                        class="restar-cantidad"
                        type="button"
                    >
                        −
                    </button>

                    <span>
                        ${item.cantidad}
                    </span>

                    <button
                        class="sumar-cantidad"
                        type="button"
                    >
                        +
                    </button>

                </div>

                <button
                    class="eliminar-carrito"
                    type="button"
                >
                    Eliminar
                </button>

            </div>

        `;


        producto.querySelector("h3")
            .textContent =
                item.nombre;


        producto
            .querySelector(".talle-carrito")
            .textContent =
                `Talle: ${item.talle}`;


        producto
            .querySelector(".precio-carrito")
            .textContent =
                `$ ${formatearPrecio(
                    item.precio * item.cantidad
                )}`;


        // RESTAR
        producto
            .querySelector(".restar-cantidad")
            .addEventListener(
                "click",
                () => {

                    cambiarCantidad(
                        indice,
                        -1
                    );

                }
            );


        // SUMAR
        producto
            .querySelector(".sumar-cantidad")
            .addEventListener(
                "click",
                () => {

                    cambiarCantidad(
                        indice,
                        1
                    );

                }
            );


        // ELIMINAR
        producto
            .querySelector(".eliminar-carrito")
            .addEventListener(
                "click",
                () => {

                    eliminarDelCarrito(
                        indice
                    );

                }
            );


        productosCarrito.appendChild(
            producto
        );
    });


    // ======================================
    // TOTAL
    // ======================================

    const total =
        carrito.reduce(
            (suma, item) =>

                suma +
                (
                    item.precio *
                    item.cantidad
                ),

            0
        );


    totalCarrito.textContent =
        `$ ${formatearPrecio(total)}`;
}


// ==========================================
// CAMBIAR CANTIDAD
// ==========================================

function cambiarCantidad(indice, cambio) {

    carrito[indice].cantidad +=
        cambio;


    if (
        carrito[indice].cantidad <= 0
    ) {

        carrito.splice(
            indice,
            1
        );
    }


    guardarCarrito();

    actualizarCarrito();
}


// ==========================================
// ELIMINAR DEL CARRITO
// ==========================================

function eliminarDelCarrito(indice) {

    carrito.splice(
        indice,
        1
    );


    guardarCarrito();

    actualizarCarrito();
}


// ==========================================
// FILTROS
// ==========================================

function activarFiltros() {

    const botonesCategoria =
        document.querySelectorAll(
            ".categorias a"
        );


    botonesCategoria.forEach(boton => {

        boton.addEventListener(
            "click",
            (evento) => {

                evento.preventDefault();


                const categoria =
                    boton.dataset.categoria;


                const productos =
                    document.querySelectorAll(
                        ".producto"
                    );


                productos.forEach(
                    producto => {

                        if (
                            categoria === "todos" ||
                            producto.dataset.categoria === categoria
                        ) {

                            producto.style.display =
                                "block";

                        } else {

                            producto.style.display =
                                "none";
                        }

                    }
                );


                cerrarMenuLateral();


                document
                    .getElementById("productos")
                    .scrollIntoView({
                        behavior: "smooth"
                    });
            }
        );
    });
}


// ==========================================
// FINALIZAR POR WHATSAPP
// ==========================================

finalizarCompra.addEventListener(
    "click",
    () => {

        if (carrito.length === 0) {

            mostrarNotificacion(
                "Tu carrito está vacío"
            );

            return;
        }


        let mensaje =
            "¡Hola! Quiero confirmar este pedido desde la web:\n\n";


        carrito.forEach(item => {

            const subtotal =
                item.precio *
                item.cantidad;


            mensaje +=
                `▪️ ${item.nombre} - Talle: ${item.talle}`;


            if (item.cantidad > 1) {

                mensaje +=
                    ` - Cantidad: ${item.cantidad}`;
            }


            mensaje +=
                ` - $ ${formatearPrecio(subtotal)}\n`;
        });


        const total =
            carrito.reduce(
                (suma, item) =>

                    suma +
                    (
                        item.precio *
                        item.cantidad
                    ),

                0
            );


        mensaje +=
            `\n*TOTAL: $ ${formatearPrecio(total)}*\n\n`;

        mensaje +=
            "¿Me confirman stock?";


        const url =
            `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;


        window.open(
            url,
            "_blank"
        );
    }
);


// ==========================================
// NOTIFICACIÓN
// ==========================================

let temporizadorNotificacion;


function mostrarNotificacion(texto) {

    clearTimeout(
        temporizadorNotificacion
    );


    notificacion.textContent =
        texto;

    notificacion.classList.add(
        "visible"
    );


    temporizadorNotificacion =
        setTimeout(
            () => {

                notificacion.classList.remove(
                    "visible"
                );

            },
            2500
        );
}


// ==========================================
// FORMATEAR PRECIOS
// ==========================================

function formatearPrecio(numero) {

    return Number(numero)
        .toLocaleString(
            "es-AR",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        );
}


// ==========================================
// INICIAR
// ==========================================

actualizarCarrito();

cargarProductosSupabase();
