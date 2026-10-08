// ==========================================
// SUPABASE
// ==========================================

const SUPABASE_URL = "https://vxaaqvdizewthswnczyo.supabase.co";
const SUPABASE_KEY = "sb_publishable_yOk2GHKWL-CMb_HKOil2IQ_--bUiqVy";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


// ==========================================
// ELEMENTOS
// ==========================================

const loginAdmin = document.getElementById("login-admin");
const panelAdmin = document.getElementById("panel-admin");
const formLogin = document.getElementById("form-login");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const mensajeLogin = document.getElementById("mensaje-login");
const cerrarSesion = document.getElementById("cerrar-sesion");

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
const galeriaEdicion = document.getElementById("galeria-edicion");


// ==========================================
// ESTADO
// ==========================================

let productoEditando = null;
let imagenesExistentes = [];
let archivosNuevos = [];


// ==========================================
// LOGIN / PANEL
// ==========================================

function mostrarPanel() {
    loginAdmin.style.display = "none";
    panelAdmin.style.display = "block";
    cargarProductos();
}

function mostrarLogin() {
    loginAdmin.style.display = "block";
    panelAdmin.style.display = "none";
}

formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    mensajeLogin.textContent = "Ingresando...";

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        console.error(error);
        mensajeLogin.textContent = "Correo o contraseña incorrectos.";
        return;
    }

    mensajeLogin.textContent = "";
    passwordInput.value = "";
    mostrarPanel();
});

cerrarSesion.addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    formLogin.reset();
    listaProductos.innerHTML = "";
    cancelarModoEdicion();
    mostrarLogin();
});

async function comprobarSesion() {
    const { data } = await supabaseClient.auth.getSession();

    if (data.session) {
        mostrarPanel();
    } else {
        mostrarLogin();
    }
}


// ==========================================
// IMÁGENES
// ==========================================

function obtenerImagenesProducto(producto) {
    if (Array.isArray(producto.imagenes_url) && producto.imagenes_url.length > 0) {
        return producto.imagenes_url.filter(Boolean);
    }

    if (producto.imagen_url) {
        return [producto.imagen_url];
    }

    return [];
}

async function subirImagen(imagen) {
    const partes = imagen.name.split(".");
    const extension = partes.length > 1 ? partes.pop().toLowerCase() : "jpg";
    const nombreArchivo = `${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const { error } = await supabaseClient.storage
        .from("productos")
        .upload(nombreArchivo, imagen, {
            cacheControl: "3600",
            upsert: false,
            contentType: imagen.type || undefined
        });

    if (error) {
        console.error(error);
        throw new Error(`No se pudo subir ${imagen.name}.`);
    }

    const { data } = supabaseClient.storage
        .from("productos")
        .getPublicUrl(nombreArchivo);

    return data.publicUrl;
}

async function subirVariasImagenes(archivos) {
    const urls = [];

    for (let i = 0; i < archivos.length; i++) {
        mensajeProducto.textContent = `Subiendo foto ${i + 1} de ${archivos.length}...`;
        const url = await subirImagen(archivos[i]);
        urls.push(url);
    }

    return urls;
}

function actualizarTextoImagenes() {
    const total = imagenesExistentes.length + archivosNuevos.length;

    if (productoEditando) {
        textoImagen.textContent = total === 0
            ? "Agregá al menos una foto antes de guardar."
            : `${total} foto${total === 1 ? "" : "s"}. Podés agregar más o quitar las que no quieras.`;
    } else {
        textoImagen.textContent = archivosNuevos.length === 0
            ? "Podés seleccionar varias fotos a la vez. La primera será la portada."
            : `${archivosNuevos.length} foto${archivosNuevos.length === 1 ? "" : "s"} seleccionada${archivosNuevos.length === 1 ? "" : "s"}.`;
    }
}

function renderGaleriaEdicion() {
    galeriaEdicion.innerHTML = "";

    imagenesExistentes.forEach((url, index) => {
        const item = document.createElement("div");
        item.className = "miniatura-edicion";

        const img = document.createElement("img");
        img.src = url;
        img.alt = `Foto actual ${index + 1}`;

        const etiqueta = document.createElement("span");
        etiqueta.className = "etiqueta-miniatura";
        etiqueta.textContent = index === 0 ? "PORTADA" : `FOTO ${index + 1}`;

        const quitar = document.createElement("button");
        quitar.type = "button";
        quitar.className = "quitar-imagen";
        quitar.textContent = "×";
        quitar.title = "Quitar foto";
        quitar.addEventListener("click", () => {
            imagenesExistentes.splice(index, 1);
            renderGaleriaEdicion();
        });

        item.appendChild(img);
        item.appendChild(etiqueta);
        item.appendChild(quitar);
        galeriaEdicion.appendChild(item);
    });

    archivosNuevos.forEach((archivo, index) => {
        const item = document.createElement("div");
        item.className = "miniatura-edicion nueva";

        const img = document.createElement("img");
        const objectUrl = URL.createObjectURL(archivo);
        img.src = objectUrl;
        img.alt = `Foto nueva ${index + 1}`;
        img.onload = () => URL.revokeObjectURL(objectUrl);

        const posicion = imagenesExistentes.length + index;
        const etiqueta = document.createElement("span");
        etiqueta.className = "etiqueta-miniatura";
        etiqueta.textContent = posicion === 0 ? "PORTADA" : `NUEVA ${index + 1}`;

        const quitar = document.createElement("button");
        quitar.type = "button";
        quitar.className = "quitar-imagen";
        quitar.textContent = "×";
        quitar.title = "Quitar foto";
        quitar.addEventListener("click", () => {
            archivosNuevos.splice(index, 1);
            renderGaleriaEdicion();
        });

        item.appendChild(img);
        item.appendChild(etiqueta);
        item.appendChild(quitar);
        galeriaEdicion.appendChild(item);
    });

    actualizarTextoImagenes();
}

imagenInput.addEventListener("change", () => {
    const seleccionadas = Array.from(imagenInput.files || []);

    if (seleccionadas.length > 0) {
        archivosNuevos.push(...seleccionadas);
    }

    imagenInput.value = "";
    renderGaleriaEdicion();
});


// ==========================================
// GUARDAR PRODUCTO
// ==========================================

formProducto.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = nombreInput.value.trim();
    const precio = Number(precioInput.value);
    const categoria = categoriaInput.value;
    const talles = tallesInput.value
        .split(",")
        .map(talle => talle.trim())
        .filter(Boolean)
        .join(", ");
    const destacado = destacadoInput.checked;

    if (!nombre) {
        mensajeProducto.textContent = "Ingresá el nombre del producto.";
        return;
    }

    if (!precio || precio <= 0) {
        mensajeProducto.textContent = "Ingresá un precio válido.";
        return;
    }

    if (!categoria) {
        mensajeProducto.textContent = "Seleccioná una categoría.";
        return;
    }

    if (!talles) {
        mensajeProducto.textContent = "Ingresá al menos un talle.";
        return;
    }

    if (!productoEditando && archivosNuevos.length === 0) {
        mensajeProducto.textContent = "Seleccioná al menos una foto.";
        return;
    }

    if (productoEditando && imagenesExistentes.length === 0 && archivosNuevos.length === 0) {
        mensajeProducto.textContent = "El producto tiene que tener al menos una foto.";
        return;
    }

    botonGuardar.disabled = true;
    cancelarEdicion.disabled = true;

    try {
        const nuevasUrls = await subirVariasImagenes(archivosNuevos);
        const imagenesFinales = [...imagenesExistentes, ...nuevasUrls];
        const portada = imagenesFinales[0] || null;

        const datosProducto = {
            nombre,
            precio,
            categoria,
            talles,
            imagen_url: portada,
            imagenes_url: imagenesFinales,
            destacado
        };

        if (productoEditando) {
            mensajeProducto.textContent = "Guardando cambios...";

            const { error } = await supabaseClient
                .from("productos")
                .update(datosProducto)
                .eq("id", productoEditando.id);

            if (error) {
                console.error(error);
                mensajeProducto.textContent = "No se pudieron guardar los cambios.";
                return;
            }

            cancelarModoEdicion();
            mensajeProducto.textContent = "Producto actualizado correctamente.";
            await cargarProductos();
            return;
        }

        mensajeProducto.textContent = "Guardando producto...";

        const { error } = await supabaseClient
            .from("productos")
            .insert([datosProducto]);

        if (error) {
            console.error(error);
            mensajeProducto.textContent = "Las fotos se subieron, pero no se pudo guardar el producto.";
            return;
        }

        formProducto.reset();
        archivosNuevos = [];
        imagenesExistentes = [];
        renderGaleriaEdicion();
        mensajeProducto.textContent = "Producto agregado correctamente.";
        await cargarProductos();

    } catch (error) {
        console.error(error);
        mensajeProducto.textContent = error.message || "Ocurrió un error.";

    } finally {
        botonGuardar.disabled = false;
        cancelarEdicion.disabled = false;
    }
});


// ==========================================
// CARGAR PRODUCTOS
// ==========================================

async function cargarProductos() {
    listaProductos.innerHTML = "<p>Cargando productos...</p>";

    const { data: productos, error } = await supabaseClient
        .from("productos")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);
        listaProductos.innerHTML = "<p>Error al cargar los productos.</p>";
        return;
    }

    listaProductos.innerHTML = "";

    if (!productos || productos.length === 0) {
        listaProductos.innerHTML = "<p>Todavía no hay productos cargados.</p>";
        return;
    }

    productos.forEach(crearTarjetaAdmin);
}

function crearTarjetaAdmin(producto) {
    const imagenes = obtenerImagenesProducto(producto);

    const tarjeta = document.createElement("div");
    tarjeta.className = "producto-admin";

    const imagen = document.createElement("img");
    imagen.src = imagenes[0] || "logo.jpeg";
    imagen.alt = producto.nombre;

    const info = document.createElement("div");
    info.className = "producto-admin-info";

    const titulo = document.createElement("h3");
    titulo.textContent = producto.nombre;

    const precio = document.createElement("p");
    precio.textContent = `$${formatearPrecio(producto.precio)}`;

    const categoria = document.createElement("p");
    categoria.textContent = `Categoría: ${producto.categoria}`;

    const talles = document.createElement("p");
    talles.textContent = `Talles: ${producto.talles || "Sin talles"}`;

    const cantidadFotos = document.createElement("p");
    cantidadFotos.className = "cantidad-fotos-admin";
    cantidadFotos.textContent = `${imagenes.length} foto${imagenes.length === 1 ? "" : "s"}`;

    info.appendChild(titulo);
    info.appendChild(precio);
    info.appendChild(categoria);
    info.appendChild(talles);
    info.appendChild(cantidadFotos);

    if (producto.destacado) {
        const destacado = document.createElement("p");
        destacado.textContent = "★ Destacado";
        info.appendChild(destacado);
    }

    const botones = document.createElement("div");
    botones.className = "producto-admin-botones";

    const botonEditar = document.createElement("button");
    botonEditar.textContent = "Editar";
    botonEditar.type = "button";
    botonEditar.addEventListener("click", () => editarProducto(producto));

    const botonEliminar = document.createElement("button");
    botonEliminar.textContent = "Eliminar";
    botonEliminar.type = "button";
    botonEliminar.addEventListener("click", () => eliminarProducto(producto));

    botones.appendChild(botonEditar);
    botones.appendChild(botonEliminar);
    info.appendChild(botones);

    tarjeta.appendChild(imagen);
    tarjeta.appendChild(info);
    listaProductos.appendChild(tarjeta);
}


// ==========================================
// EDITAR / CANCELAR
// ==========================================

function editarProducto(producto) {
    productoEditando = producto;
    imagenesExistentes = obtenerImagenesProducto(producto);
    archivosNuevos = [];

    nombreInput.value = producto.nombre || "";
    precioInput.value = producto.precio || "";
    categoriaInput.value = producto.categoria || "";
    tallesInput.value = producto.talles || "";
    destacadoInput.checked = Boolean(producto.destacado);
    imagenInput.value = "";

    tituloFormulario.textContent = `Editar: ${producto.nombre}`;
    botonGuardar.textContent = "Guardar cambios";
    cancelarEdicion.style.display = "block";

    renderGaleriaEdicion();

    tituloFormulario.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function cancelarModoEdicion() {
    productoEditando = null;
    imagenesExistentes = [];
    archivosNuevos = [];

    formProducto.reset();
    tituloFormulario.textContent = "Agregar producto";
    botonGuardar.textContent = "Agregar producto";
    cancelarEdicion.style.display = "none";
    imagenInput.value = "";
    renderGaleriaEdicion();
}

cancelarEdicion.addEventListener("click", () => {
    cancelarModoEdicion();
    mensajeProducto.textContent = "";
});


// ==========================================
// ELIMINAR PRODUCTO
// ==========================================

async function eliminarProducto(producto) {
    const confirmar = confirm(`¿Seguro que querés eliminar "${producto.nombre}"?`);

    if (!confirmar) {
        return;
    }

    mensajeProducto.textContent = "Eliminando producto...";

    const { error } = await supabaseClient
        .from("productos")
        .delete()
        .eq("id", producto.id);

    if (error) {
        console.error(error);
        mensajeProducto.textContent = "No se pudo eliminar el producto.";
        return;
    }

    if (productoEditando && productoEditando.id === producto.id) {
        cancelarModoEdicion();
    }

    mensajeProducto.textContent = "Producto eliminado correctamente.";
    await cargarProductos();
}


// ==========================================
// UTILIDADES
// ==========================================

function formatearPrecio(precio) {
    return Number(precio).toLocaleString("es-AR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}

supabaseClient.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") {
        mostrarLogin();
    }
});

renderGaleriaEdicion();
comprobarSesion();
