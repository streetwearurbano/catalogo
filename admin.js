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
// ELEMENTOS
// ==========================================

// Login
const loginAdmin = document.getElementById("login-admin");
const panelAdmin = document.getElementById("panel-admin");

const formLogin = document.getElementById("form-login");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const mensajeLogin = document.getElementById("mensaje-login");

const cerrarSesion = document.getElementById("cerrar-sesion");


// Productos
const formProducto = document.getElementById("form-producto");

const nombreInput = document.getElementById("nombre");
const precioInput = document.getElementById("precio");
const categoriaInput = document.getElementById("categoria");
const tallesInput = document.getElementById("talles");
const imagenInput = document.getElementById("imagen");
const destacadoInput = document.getElementById("destacado");

const mensajeProducto = document.getElementById("mensaje-producto");
const listaProductos = document.getElementById("lista-productos");

const tituloFormulario = document.getElementById("titulo-formulario");
const botonGuardar = document.getElementById("boton-guardar");
const cancelarEdicion = document.getElementById("cancelar-edicion");
const textoImagen = document.getElementById("texto-imagen");


// ==========================================
// ESTADO DE EDICIÓN
// ==========================================

let productoEditando = null;


// ==========================================
// MOSTRAR PANEL
// ==========================================

function mostrarPanel() {

    loginAdmin.style.display = "none";
    panelAdmin.style.display = "block";

    cargarProductos();
}


// ==========================================
// MOSTRAR LOGIN
// ==========================================

function mostrarLogin() {

    loginAdmin.style.display = "block";
    panelAdmin.style.display = "none";
}


// ==========================================
// LOGIN
// ==========================================

formLogin.addEventListener("submit", async (e) => {

    e.preventDefault();

    mensajeLogin.textContent = "Ingresando...";

    const email = emailInput.value.trim();
    const password = passwordInput.value;


    const { error } =
        await supabaseClient.auth.signInWithPassword({
            email,
            password
        });


    if (error) {

        console.error(error);

        mensajeLogin.textContent =
            "Correo o contraseña incorrectos.";

        return;
    }


    mensajeLogin.textContent = "";

    passwordInput.value = "";

    mostrarPanel();
});


// ==========================================
// CERRAR SESIÓN
// ==========================================

cerrarSesion.addEventListener("click", async () => {

    await supabaseClient.auth.signOut();

    formLogin.reset();

    listaProductos.innerHTML = "";

    cancelarModoEdicion();

    mostrarLogin();
});


// ==========================================
// COMPROBAR SESIÓN
// ==========================================

async function comprobarSesion() {

    const { data } =
        await supabaseClient.auth.getSession();


    if (data.session) {

        mostrarPanel();

    } else {

        mostrarLogin();
    }
}


// ==========================================
// SUBIR IMAGEN
// ==========================================

async function subirImagen(imagen) {

    const extension =
        imagen.name.split(".").pop();


    const nombreArchivo =
        `${Date.now()}-${crypto.randomUUID()}.${extension}`;


    const { error } =
        await supabaseClient.storage
            .from("productos")
            .upload(
                nombreArchivo,
                imagen,
                {
                    cacheControl: "3600",
                    upsert: false
                }
            );


    if (error) {

        console.error(error);

        throw new Error("No se pudo subir la imagen.");
    }


    const { data } =
        supabaseClient.storage
            .from("productos")
            .getPublicUrl(nombreArchivo);


    return data.publicUrl;
}


// ==========================================
// ENVIAR FORMULARIO
// ==========================================

formProducto.addEventListener("submit", async (e) => {

    e.preventDefault();


    const nombre =
        nombreInput.value.trim();

    const precio =
        Number(precioInput.value);

    const categoria =
        categoriaInput.value;

    const talles =
        tallesInput.value
            .split(",")
            .map(talle => talle.trim())
            .filter(talle => talle !== "")
            .join(", ");

    const imagen =
        imagenInput.files[0];

    const destacado =
        destacadoInput.checked;


    // ======================================
    // VALIDACIONES
    // ======================================

    if (!nombre) {

        mensajeProducto.textContent =
            "Ingresá el nombre del producto.";

        return;
    }


    if (!precio || precio <= 0) {

        mensajeProducto.textContent =
            "Ingresá un precio válido.";

        return;
    }


    if (!categoria) {

        mensajeProducto.textContent =
            "Seleccioná una categoría.";

        return;
    }


    if (!talles) {

        mensajeProducto.textContent =
            "Ingresá al menos un talle.";

        return;
    }


    // Si estamos creando, la imagen es obligatoria.

    if (!productoEditando && !imagen) {

        mensajeProducto.textContent =
            "Seleccioná una imagen.";

        return;
    }


    mensajeProducto.textContent =
        productoEditando
            ? "Guardando cambios..."
            : "Subiendo producto...";


    try {

        let imagenURL =
            productoEditando
                ? productoEditando.imagen_url
                : null;


        // ==================================
        // SUBIR FOTO NUEVA SI HAY UNA
        // ==================================

        if (imagen) {

            imagenURL =
                await subirImagen(imagen);
        }


        // ==================================
        // EDITAR PRODUCTO
        // ==================================

        if (productoEditando) {

            const { error } =
                await supabaseClient
                    .from("productos")
                    .update({
                        nombre,
                        precio,
                        categoria,
                        talles,
                        imagen_url: imagenURL,
                        destacado
                    })
                    .eq(
                        "id",
                        productoEditando.id
                    );


            if (error) {

                console.error(error);

                mensajeProducto.textContent =
                    "No se pudieron guardar los cambios.";

                return;
            }


            mensajeProducto.textContent =
                "Producto actualizado correctamente.";

            cancelarModoEdicion();

            await cargarProductos();

            return;
        }


        // ==================================
        // CREAR PRODUCTO
        // ==================================

        const { error } =
            await supabaseClient
                .from("productos")
                .insert([
                    {
                        nombre,
                        precio,
                        categoria,
                        talles,
                        imagen_url: imagenURL,
                        destacado
                    }
                ]);


        if (error) {

            console.error(error);

            mensajeProducto.textContent =
                "La imagen se subió, pero no se pudo guardar el producto.";

            return;
        }


        mensajeProducto.textContent =
            "Producto agregado correctamente.";


        formProducto.reset();

        textoImagen.textContent =
            "Seleccioná una imagen";


        await cargarProductos();


    } catch (error) {

        console.error(error);

        mensajeProducto.textContent =
            error.message ||
            "Ocurrió un error.";
    }
});


// ==========================================
// CARGAR PRODUCTOS
// ==========================================

async function cargarProductos() {

    listaProductos.innerHTML =
        "<p>Cargando productos...</p>";


    const { data: productos, error } =
        await supabaseClient
            .from("productos")
            .select("*")
            .order(
                "created_at",
                { ascending: false }
            );


    if (error) {

        console.error(error);

        listaProductos.innerHTML =
            "<p>Error al cargar los productos.</p>";

        return;
    }


    listaProductos.innerHTML = "";


    if (!productos || productos.length === 0) {

        listaProductos.innerHTML =
            "<p>Todavía no hay productos cargados.</p>";

        return;
    }


    productos.forEach(producto => {

        crearTarjetaAdmin(producto);

    });
}


// ==========================================
// CREAR TARJETA
// ==========================================

function crearTarjetaAdmin(producto) {

    const tarjeta =
        document.createElement("div");

    tarjeta.className =
        "producto-admin";


    // Imagen
    const imagen =
        document.createElement("img");

    imagen.src =
        producto.imagen_url;

    imagen.alt =
        producto.nombre;


    // Información
    const info =
        document.createElement("div");

    info.className =
        "producto-admin-info";


    const titulo =
        document.createElement("h3");

    titulo.textContent =
        producto.nombre;


    const precio =
        document.createElement("p");

    precio.textContent =
        `$${formatearPrecio(producto.precio)}`;


    const categoria =
        document.createElement("p");

    categoria.textContent =
        `Categoría: ${producto.categoria}`;


    const talles =
        document.createElement("p");

    talles.textContent =
        `Talles: ${producto.talles || "Sin talles"}`;


    info.appendChild(titulo);
    info.appendChild(precio);
    info.appendChild(categoria);
    info.appendChild(talles);


    if (producto.destacado) {

        const destacado =
            document.createElement("p");

        destacado.textContent =
            "★ Destacado";

        info.appendChild(destacado);
    }


    // ======================================
    // BOTONES
    // ======================================

    const botones =
        document.createElement("div");

    botones.className =
        "producto-admin-botones";


    // Editar
    const botonEditar =
        document.createElement("button");

    botonEditar.textContent =
        "Editar";

    botonEditar.type =
        "button";

    botonEditar.addEventListener(
        "click",
        () => editarProducto(producto)
    );


    // Eliminar
    const botonEliminar =
        document.createElement("button");

    botonEliminar.textContent =
        "Eliminar";

    botonEliminar.type =
        "button";

    botonEliminar.addEventListener(
        "click",
        () => eliminarProducto(producto)
    );


    botones.appendChild(botonEditar);
    botones.appendChild(botonEliminar);

    info.appendChild(botones);

    tarjeta.appendChild(imagen);
    tarjeta.appendChild(info);

    listaProductos.appendChild(tarjeta);
}


// ==========================================
// EDITAR PRODUCTO
// ==========================================

function editarProducto(producto) {

    productoEditando = producto;


    nombreInput.value =
        producto.nombre || "";

    precioInput.value =
        producto.precio || "";

    categoriaInput.value =
        producto.categoria || "";

    tallesInput.value =
        producto.talles || "";

    destacadoInput.checked =
        Boolean(producto.destacado);


    imagenInput.value = "";


    tituloFormulario.textContent =
        `Editar: ${producto.nombre}`;

    botonGuardar.textContent =
        "Guardar cambios";

    cancelarEdicion.style.display =
        "block";

    textoImagen.textContent =
        "Dejá este campo vacío para mantener la imagen actual";


    // Llevar al usuario al formulario
    tituloFormulario.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


// ==========================================
// CANCELAR EDICIÓN
// ==========================================

function cancelarModoEdicion() {

    productoEditando = null;

    formProducto.reset();

    tituloFormulario.textContent =
        "Agregar producto";

    botonGuardar.textContent =
        "Agregar producto";

    cancelarEdicion.style.display =
        "none";

    textoImagen.textContent =
        "Seleccioná una imagen";
}


cancelarEdicion.addEventListener(
    "click",
    () => {

        cancelarModoEdicion();

        mensajeProducto.textContent = "";
    }
);


// ==========================================
// MOSTRAR NOMBRE DE FOTO
// ==========================================

imagenInput.addEventListener("change", () => {

    const archivo =
        imagenInput.files[0];


    if (archivo) {

        textoImagen.textContent =
            archivo.name;

    } else if (productoEditando) {

        textoImagen.textContent =
            "Dejá este campo vacío para mantener la imagen actual";

    } else {

        textoImagen.textContent =
            "Seleccioná una imagen";
    }
});


// ==========================================
// ELIMINAR PRODUCTO
// ==========================================

async function eliminarProducto(producto) {

    const confirmar =
        confirm(
            `¿Seguro que querés eliminar "${producto.nombre}"?`
        );


    if (!confirmar) {
        return;
    }


    mensajeProducto.textContent =
        "Eliminando producto...";


    const { error } =
        await supabaseClient
            .from("productos")
            .delete()
            .eq(
                "id",
                producto.id
            );


    if (error) {

        console.error(error);

        mensajeProducto.textContent =
            "No se pudo eliminar el producto.";

        return;
    }


    // Si justo estábamos editando ese producto
    if (
        productoEditando &&
        productoEditando.id === producto.id
    ) {

        cancelarModoEdicion();
    }


    mensajeProducto.textContent =
        "Producto eliminado correctamente.";


    await cargarProductos();
}


// ==========================================
// FORMATEAR PRECIO
// ==========================================

function formatearPrecio(precio) {

    return Number(precio)
        .toLocaleString(
            "es-AR",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        );
}


// ==========================================
// CAMBIO DE SESIÓN
// ==========================================

supabaseClient.auth.onAuthStateChange(
    (event) => {

        if (event === "SIGNED_OUT") {

            mostrarLogin();
        }
    }
);


// ==========================================
// INICIAR
// ==========================================

comprobarSesion();
