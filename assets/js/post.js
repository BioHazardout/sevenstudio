// ============================================
// LOGICA DE SANITY CMS PARA EL POST INDIVIDUAL
// ============================================

const SANITY_PROJECT_ID = 'ptbd9rkj'; // Project ID de Seven Studio
const SANITY_DATASET = 'production';
const SANITY_API_VERSION = "2023-05-03"; 

// 1. Obtener el slug de la URL (?slug=mi-articulo)
const urlParams = new URLSearchParams(window.location.search);
const slug = urlParams.get('slug');

const postTitle = document.getElementById('post-title');
const postDate = document.getElementById('post-date');
const postImage = document.getElementById('post-image');
const postContent = document.getElementById('post-content');

// Función simple para convertir bloques de Portable Text (Sanity) a HTML
function portableTextToHTML(blocks) {
    if (!blocks || !Array.isArray(blocks)) return '<p>No hay contenido disponible.</p>';
    
    let html = '';
    blocks.forEach(block => {
        if (block._type !== 'block') return; // Ignorar imágenes u otros tipos por ahora
        
        let text = '';
        if (block.children && Array.isArray(block.children)) {
            block.children.forEach(child => {
                // Manejar negritas, cursivas, etc si las tienen marcadas
                let childText = child.text;
                if (child.marks && child.marks.includes('strong')) {
                    childText = `<strong>${childText}</strong>`;
                }
                text += childText;
            });
        }
        
        // Manejar los diferentes estilos de párrafos y títulos
        switch (block.style) {
            case 'h1': html += `<h1>${text}</h1>`; break;
            case 'h2': html += `<h2>${text}</h2>`; break;
            case 'h3': html += `<h3>${text}</h3>`; break;
            case 'h4': html += `<h4>${text}</h4>`; break;
            case 'blockquote': html += `<blockquote>${text}</blockquote>`; break;
            default: html += `<p>${text}</p>`; break; // 'normal'
        }
    });
    return html;
}

async function fetchSinglePost() {
    if (!slug) {
        postTitle.innerText = "Artículo no encontrado";
        postContent.innerHTML = "<p>Regresa al blog para leer más artículos.</p>";
        return;
    }

    try {
        // Consulta GROQ para pedir SOLO el artículo que coincida con el slug
        const QUERY = encodeURIComponent(`*[_type == "post" && slug.current == "${slug}"][0] { 
            title, 
            publishedAt, 
            "imageUrl": mainImage.asset->url, 
            body 
        }`);
        
        const API_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${QUERY}`;
        
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Error al conectar con Sanity CMS.');
        
        const data = await response.json();
        const post = data.result;

        if (post) {
            // Llenar el título
            postTitle.innerText = post.title;
            
            // Llenar la fecha
            const date = new Date(post.publishedAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
            postDate.innerHTML = `<i class="uil uil-calendar-alt"></i> ${date}`;
            
            // Llenar la imagen (si existe)
            if (post.imageUrl) {
                postImage.src = post.imageUrl;
                postImage.alt = post.title;
                postImage.style.display = 'block'; // Mostrarla
            }
            
            // Renderizar el contenido
            postContent.innerHTML = portableTextToHTML(post.body);
            
        } else {
            postTitle.innerText = "Artículo no encontrado";
            postContent.innerHTML = "<p>Parece que este artículo ya no existe o cambió de enlace.</p>";
        }
        
    } catch (error) {
        console.error(error);
        postTitle.innerText = "Error de conexión";
        postContent.innerHTML = "<p>Hubo un problema cargando el artículo. Por favor, intenta de nuevo más tarde.</p>";
    }
}

// Ejecutar la función cuando cargue la página
document.addEventListener('DOMContentLoaded', fetchSinglePost);
