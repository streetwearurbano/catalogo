// ==========================================
// SUPABASE
// ==========================================

const SUPABASE_URL = "https://vxaaqvdizewthswnczyo.supabase.co";
const SUPABASE_KEY = "sb_publishable_yOk2GHKWL-CMb_HKOil2IQ_--bUiqVy";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ================================
// ELEMENTOS DEL MENÚ
// ================================

const abrirMenu = document.getElementById("abrirMenu");
const cerrarMenu = document.getElementById("cerrarMenu");

const menuLateral = document.getElementById("menuLateral");
const fondoMenu = document.getElementById("fondoMenu");


// ================================
// ABRIR MENÚ
// ================================

abrirMenu.addEventListener("click", () => {

    menuLateral.classList.add("activo");
    fondoMenu.classList.add("activo");

    document.body.style.overflow = "hidden";

});


// ================================
// CERRAR MENÚ
// ================================

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
// CONTENEDOR DE PRODUCTOS
// ==========================================

const contenedorProductos =
    document.getElementById("productos");


// ==========================================
// CARGAR PRODUCTOS DESDE SUPABASE
// ==========================================

async function cargarProductosSupabase() {

    const { data: productos, error } =
        await supabaseClient
            .from("productos")
            .select("*")
            .order("created_at", {
                ascending: false
            });


    if (error) {

        console.error(
            "Error cargando productos:",
            error
        );

        return;
    }


    productos.forEach(producto => {

        crearProducto(producto);

    });


    activarFiltros();

}


// ==========================================
// CREAR PRODUCTO EN LA PÁGINA
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

    const imagen =
        document.createElement("img");

    imagen.src =
        producto.imagen_url;

    imagen.alt =
        producto.nombre;

    imagen.loading =
        "lazy";


    // ======================================
    // INFORMACIÓN
    // ======================================

    const informacion =
        document.createElement("div");

    informacion.className =
        "producto-info";


    const nombre =
        document.createElement("h3");

    nombre.textContent =
        producto.nombre;


    const precio =
        document.createElement("p");

    precio.className =
        "precio";

    precio.textContent =
        `$${Number(producto.precio)
            .toLocaleString("es-AR")}`;


    // ======================================
    // DESTACADO
    // ======================================

    if (producto.destacado) {

        const destacado =
            document.createElement("span");

        destacado.className =
            "producto-destacado";

        destacado.textContent =
            "DESTACADO";

        informacion.appendChild(
            destacado
        );
    }


    informacion.appendChild(
        nombre
    );

    informacion.appendChild(
        precio
    );


    tarjeta.appendChild(
        imagen
    );

    tarjeta.appendChild(
        informacion
    );


    contenedorProductos.appendChild(
        tarjeta
    );

}


// ==========================================
// FILTROS DE CATEGORÍAS
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

                        const categoriaProducto =
                            producto.dataset.categoria;


                        if (
                            categoria === "todos" ||
                            categoriaProducto === categoria
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
// INICIAR
// ==========================================

cargarProductosSupabase();
