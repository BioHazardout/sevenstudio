// ============================================
// LOGICA DE SANITY CMS PARA EL BLOG
// ============================================


const SANITY_PROJECT_ID = 'pzmuujgi'; 
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
                    <div class="blog__card" style="background: var(--container-color); padding: 1.5rem; border-radius: 1rem; box-shadow: 0 4px 20px rgba(0,0,0,0.1); border: 1px solid var(--text-color-light); transition: .3s;">
                        <img src="${post.imageUrl || 'assets/img/nosotros.webp'}" alt="${post.title}" style="border-radius: 1rem; margin-bottom: 1rem; width: 100%; height: 200px; object-fit: cover;">
                        <div class="blog__data">
                            <span class="blog__date" style="font-size: var(--small-font-size); color: var(--text-color-light); margin-bottom: 0.5rem; display: block;">${date}</span>
                            <h3 class="blog__title" style="font-size: var(--h3-font-size); margin-bottom: 1rem;">${post.title}</h3>
                            <p class="blog__description" style="font-size: var(--small-font-size); margin-bottom: 1rem;">${post.description || 'Lee más sobre este artículo...'}</p>
                            <a href="post.html?slug=${post.slug}" class="button button--flex button--small" style="background: transparent; color: var(--first-color); border: 1px solid var(--first-color);">
                                Leer más <i class="uil uil-arrow-right button__icon"></i>
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
