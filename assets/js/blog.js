// ============================================
// LOGICA DE SANITY CMS PARA EL BLOG
// ============================================


const SANITY_PROJECT_ID = 'ptbd9rkj'; 
const SANITY_DATASET = 'production';
const SANITY_API_VERSION = '2023-05-03'; // Fecha de la API

// URL de consulta de la API de Sanity
// Esta consulta pide todos los posts, ordenados por fecha, y extrae título, fecha, descripción, imagen y slug.
const QUERY = encodeURIComponent('*[_type == "post"] | order(publishedAt desc) { title, publishedAt, description, "imageUrl": mainImage.asset->url, "slug": slug.current }');
const API_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${QUERY}`;

const blogContainer = document.getElementById('blog-container');

async function fetchBlogPosts() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Error al conectar con Sanity CMS. Verifica tu Project ID.');
        }
        const data = await response.json();
        const posts = data.result;

        if (posts && posts.length > 0) {
            // Limpiar el placeholder
            blogContainer.innerHTML = '';

            posts.forEach(post => {
                const date = new Date(post.publishedAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
                
                // Crear el HTML de la tarjeta
                const cardHTML = `
                    <div class="services__card">
                        <img src="${post.imageUrl || 'assets/img/nosotros.webp'}" alt="${post.title}" class="services__card-image" loading="lazy" style="height: 200px; width: 100%; object-fit: cover;">
                        <div class="services__card-content">
                            <span style="font-size: var(--small-font-size); color: var(--text-color-light); margin-bottom: 0.5rem; display: block; text-align: center; margin-top: 1rem;">${date}</span>
                            <h2 class="services__card-title" style="margin-bottom: 0.5rem;">${post.title}</h2>
                            <p class="services__card-description">${post.description || 'Lee más sobre este artículo...'}</p>
                            <a href="post.html?slug=${post.slug}">
                                <span class="button button--flex button--small button--link services__button"> Leer Más 
                                    <i class="uil uil-arrow-right button__icon"></i>
                                </span>
                            </a>
                        </div>
                    </div>
                `;
                blogContainer.innerHTML += cardHTML;
            });
        }
    } catch (error) {
        console.error("No se pudieron cargar los posts del blog:", error);
        // Si hay error (como no haber configurado el ID aún), mostramos un mensaje en consola y dejamos el placeholder.
    }
}

// Inicializar la carga cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Solo si el usuario configuró su ID, intentamos cargar. 
    // De lo contrario, se queda el diseño Placeholder para que vea cómo luce.
    if(SANITY_PROJECT_ID !== 'TU_PROJECT_ID') {
        fetchBlogPosts();
    }
});
