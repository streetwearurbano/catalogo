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
// ELEMENTOS DEL HTML
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
const imagenInput = document.getElementById("imagen");
const destacadoInput = document.getElementById("destacado");

const mensajeProducto = document.getElementById("mensaje-producto");
const listaProductos = document.getElementById("lista-productos");


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

    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
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
// AGREGAR PRODUCTO
// ==========================================

formProducto.addEventListener("submit", async (e) => {

    e.preventDefault();


    const nombre = nombreInput.value.trim();

    const precio = Number(precioInput.value);

    const categoria = categoriaInput.value;

    const imagen = imagenInput.files[0];

    const destacado = destacadoInput.checked;


    // Validaciones
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


    if (!imagen) {

        mensajeProducto.textContent =
            "Seleccioná una imagen.";

        return;
    }


    mensajeProducto.textContent =
        "Subiendo producto...";


    try {

        // ==================================
        // NOMBRE ÚNICO PARA LA IMAGEN
        // ==================================

        const extension =
            imagen.name.split(".").pop();

        const nombreArchivo =
            `${Date.now()}-${crypto.randomUUID()}.${extension}`;


        // ==================================
        // SUBIR IMAGEN A STORAGE
        // ==================================

        const { error: errorImagen } =
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


        if (errorImagen) {

            console.error(errorImagen);

            mensajeProducto.textContent =
                "Error al subir la imagen.";

            return;
        }


        // ==================================
        // OBTENER URL PÚBLICA
        // ==================================

        const { data: datosURL } =
            supabaseClient.storage
                .from("productos")
                .getPublicUrl(nombreArchivo);


        const imagenURL =
            datosURL.publicUrl;


        // ==================================
        // GUARDAR PRODUCTO EN LA TABLA
        // ==================================

        const { error: errorProducto } =
            await supabaseClient
                .from("productos")
                .insert([
                    {
                        nombre: nombre,
                        precio: precio,
                        categoria: categoria,
                        imagen_url: imagenURL,
                        destacado: destacado
                    }
                ]);


        if (errorProducto) {

            console.error(errorProducto);

            mensajeProducto.textContent =
                "La imagen se subió, pero hubo un error al guardar el producto.";

            return;
        }


        // ==================================
        // PRODUCTO CREADO
        // ==================================

        mensajeProducto.textContent =
            "Producto agregado correctamente.";

        formProducto.reset();

        await cargarProductos();


    } catch (error) {

        console.error(error);

        mensajeProducto.textContent =
            "Ocurrió un error al agregar el producto.";
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


    productos.forEach((producto) => {

        const tarjeta =
            document.createElement("div");

        tarjeta.className =
            "producto-admin";


        const imagen =
            document.createElement("img");

        imagen.src =
            producto.imagen_url;

        imagen.alt =
            producto.nombre;


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
            `$${Number(producto.precio).toLocaleString("es-AR")}`;


        const categoria =
            document.createElement("p");

        categoria.textContent =
            `Categoría: ${producto.categoria}`;


        const destacado =
            document.createElement("p");

        destacado.textContent =
            producto.destacado
                ? "★ Producto destacado"
                : "";


        // ==================================
        // BOTONES
        // ==================================

        const botones =
            document.createElement("div");

        botones.className =
            "producto-admin-botones";


        const botonEliminar =
            document.createElement("button");

        botonEliminar.textContent =
            "Eliminar";


        botonEliminar.addEventListener(
            "click",
            () => eliminarProducto(producto)
        );


        botones.appendChild(
            botonEliminar
        );


        info.appendChild(
            titulo
        );

        info.appendChild(
            precio
        );

        info.appendChild(
            categoria
        );


        if (producto.destacado) {

            info.appendChild(
                destacado
            );
        }


        info.appendChild(
            botones
        );


        tarjeta.appendChild(
            imagen
        );

        tarjeta.appendChild(
            info
        );


        listaProductos.appendChild(
            tarjeta
        );
    });
}


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


    // ==================================
    // BORRAR DE LA TABLA
    // ==================================

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


    mensajeProducto.textContent =
        "Producto eliminado correctamente.";


    await cargarProductos();
}


// ==========================================
// ESCUCHAR CAMBIOS DE SESIÓN
// ==========================================

supabaseClient.auth.onAuthStateChange(
    (event, session) => {

        if (
            event === "SIGNED_OUT"
        ) {

            mostrarLogin();
        }
    }
);


// ==========================================
// INICIAR
// ==========================================

comprobarSesion();
