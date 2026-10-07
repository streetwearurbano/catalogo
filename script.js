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


cerrarMenu.addEventListener("click", cerrarMenuLateral);

fondoMenu.addEventListener("click", cerrarMenuLateral);


// ================================
// FILTRAR PRODUCTOS
// ================================

const botonesCategoria =
    document.querySelectorAll(".categorias a");

const productos =
    document.querySelectorAll(".producto");


botonesCategoria.forEach(boton => {

    boton.addEventListener("click", (evento) => {

        evento.preventDefault();

        const categoria =
            boton.dataset.categoria;


        productos.forEach(producto => {

            const categoriaProducto =
                producto.dataset.categoria;


            if (
                categoria === "todos" ||
                categoriaProducto === categoria
            ) {

                producto.style.display = "block";

            } else {

                producto.style.display = "none";

            }

        });


        cerrarMenuLateral();


        // Baja automáticamente a los productos

        document
            .getElementById("productos")
            .scrollIntoView({
                behavior: "smooth"
            });

    });

});
