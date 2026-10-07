// ==============================
// CONEXIÓN CON SUPABASE
// ==============================

const SUPABASE_URL = "https://vxaaqvdizewthswnczyo.supabase.co";
const SUPABASE_KEY = "sb_publishable_yOk2GHKWL-CMb_HKOil2IQ_--bUiqVy";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ==============================
// ELEMENTOS DEL HTML
// ==============================

const loginAdmin = document.getElementById("login-admin");
const panelAdmin = document.getElementById("panel-admin");

const formLogin = document.getElementById("form-login");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const mensajeLogin = document.getElementById("mensaje-login");

const cerrarSesion = document.getElementById("cerrar-sesion");


// ==============================
// MOSTRAR PANEL
// ==============================

function mostrarPanel() {
    loginAdmin.style.display = "none";
    panelAdmin.style.display = "block";
}


// ==============================
// MOSTRAR LOGIN
// ==============================

function mostrarLogin() {
    loginAdmin.style.display = "block";
    panelAdmin.style.display = "none";
}


// ==============================
// INICIAR SESIÓN
// ==============================

formLogin.addEventListener("submit", async (e) => {

    e.preventDefault();

    mensajeLogin.textContent = "Ingresando...";

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    const { data, error } = await supabaseClient.auth.signInWithPassword({
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


// ==============================
// CERRAR SESIÓN
// ==============================

cerrarSesion.addEventListener("click", async () => {

    await supabaseClient.auth.signOut();

    formLogin.reset();

    mostrarLogin();
});


// ==============================
// COMPROBAR SESIÓN AL ENTRAR
// ==============================

async function comprobarSesion() {

    const { data } = await supabaseClient.auth.getSession();

    if (data.session) {
        mostrarPanel();
    } else {
        mostrarLogin();
    }
}

comprobarSesion();
