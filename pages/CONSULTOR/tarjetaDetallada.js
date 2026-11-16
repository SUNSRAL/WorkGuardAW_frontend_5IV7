 //libreria de iconos   
   document.addEventListener("DOMContentLoaded", () => {
    const lucideScript = document.createElement("script");

    lucideScript.src = "https://unpkg.com/lucide@latest";

    lucideScript.onload = () => {
        iniciarAppWorkGuard();
    };

    document.head.appendChild(lucideScript);
});

function iniciardetalleWorkguard(){
//aqui pongo todo el css

const style = document.createElement("style");
style.textContent=`
      :root {
        --bg-base: rgba(11, 22, 44, 0.9);
        --bg-panel: #0D121E;
        --bg-card: #141B2D;
        --bg-hover: #1C253D;
        --border: #232E47;
        --border-active: #3B4D75;
        --text-main: #F8FAFC;
        --text-muted: #94A3B8;
        --text-dim: #64748B;
        --gold: #D4A359;
        --gold-light: #E8BD78;
        --gold-tint: rgba(212, 163, 89, 0.14);
        --green: #10B981;
        --green-tint: rgba(16, 185, 129, 0.12);
        --red: #EF4444;
        --red-tint: rgba(239, 68, 68, 0.12);
      }
        * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      body {
        background-color: var(--bg-base);
        color: var(--text-main);
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }
    /* NAVBAR */
      .navbar {
        height: 62px;
        background-color: rgba(13, 18, 30, 0.9);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid var(--border);
        padding: 0 28px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: sticky;
        top: 0;
        z-index: 50;
      }

      .nav-left {
        display: flex;
        align-items: center;
        gap: 20px;
      }
        //diseño botones 
      .btn-regresar{
      display: inline-flex;
      gap: 6px;
      background: var(--bg-card);
      border: 1px solid var(--border);
        color: var(--text-main);
        padding: 7px 14px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: 0.2s;
      }
        .btn-regresar:hover{
        border-color: var(--gold);
        color: var(--gold)
        }
        .brand {
        font-size: 20px;
        font-weight: 800;
        display: flex;
        align-items: center;
        gap: 8px;
        letter-spacing: -0.4px;
      }
        .brand span { color: var(--gold); }

    
      .nav-right {
        display: flex;
        align-items: center;
        gap: 14px;
      }
        .nav-item {
        color: var(--text-muted);
        text-decoration: none;
        font-size: 13px;
        font-weight: 500;
        padding: 6px 10px;
        border-radius: 6px;
        transition: 0.2s;
      }

      .nav-item:hover {
        color: var(--text-main);
        background: var(--bg-card);
      }

      /* WORKSPACE */
      .workspace {
        flex: 1;
        max-width: 1440px;
        width: 100%;
        margin: 0 auto;
        padding: 20px 28px;
        display: grid;
        grid-template-columns: 1.35fr 1fr;
        gap: 22px;
        align-items: stretch;
      }
        /* COLUMNA IZQUIERDA */
      .cartaEmpresa {
        background: var(--bg-panel);
        border: 1px solid var(--border);
        border-radius: 16px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
        .cajafotos{
        position: relative;
        height: 290px;
        background: #000;
        overflow: hidden;
      }
        .cajafotos img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.4s ease, opacity 0.25s ease;
      }

      .cajafotos:hover img {
        transform: scale(1.02);
      }
        .fotos-gradient {
        position: absolute;
        inset: 0;
        background: linear-gradient(to top, rgba(13, 18, 30, 1) 5%, rgba(13, 18, 30, 0.2) 55%, transparent 100%);
        pointer-events: none;
      }

      .fotos-controls {
        position: absolute;
        top: 14px;
        right: 14px;
        display: flex;
        gap: 8px;
      }
        .ciculobtnfotos {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: rgba(13, 18, 30, 0.78);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: #fff;
        display: grid;
        place-items: center;
        cursor: pointer;
        transition: 0.2s;
      }
        .ciculobtnfotos:hover {
        background: var(--gold);
        color: #000;
        border-color: var(--gold);
      }

      .floating-thumbs {
        position: absolute;
        bottom: 16px;
        right: 20px;
        display: flex;
        gap: 8px;
        z-index: 5;
      }
    
      .mini-thumb {
        width: 52px;
        height: 36px;
        border-radius: 6px;
        overflow: hidden;
        border: 2px solid rgba(255, 255, 255, 0.3);
        cursor: pointer;
        opacity: 0.65;
        transition: 0.2s;
      }

      .mini-thumb:hover { opacity: 1; }
      .mini-thumb.active {
        border-color: var(--gold);
        opacity: 1;
        transform: translateY(-2px);
      }

      .mini-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
        .sheet-header {
        padding: 0 24px 18px;
        margin-top: -34px;
        position: relative;
        z-index: 4;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 16px;
        border-bottom: 1px solid var(--border);
      }
        .titulo h1 {
        font-size: 24px;
        font-weight: 800;
        letter-spacing: -0.3px;
        margin-bottom: 6px;
      }
        .badges-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
      }

      .badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
      }
        .cajaverficado {
        background: var(--green-tint);
        color: var(--green);
        border: 1px solid rgba(16, 185, 129, 0.28);
      }
        .cajacategoria {
        background: var(--gold-tint);
        color: var(--gold);
        border: 1px solid rgba(212, 163, 89, 0.28);
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-shrink: 0;
      }
        .btnfavs {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: var(--bg-card);
        border: 1px solid var(--border-active);
        color: var(--text-main);
        padding: 9px 16px;
        border-radius: 10px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btnfavs:hover {
        border-color: var(--gold);
        background: var(--bg-hover);
      }

      .btnfavs.active {
        background: var(--gold-tint);
        border-color: var(--gold);
        color: var(--gold);
      }

      .btnfavs.active svg {
        fill: var(--gold);
      }

      .btnreportar {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: transparent;
        border: 1px solid var(--border);
        color: var(--text-muted);
        padding: 9px 14px;
        border-radius: 10px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        transition: 0.2s;
      }
    
      .btnreportar:hover{
      background: var(--red-tint)
      }

      .carta-body {
        padding: 20px 24px;
        display: flex;
        flex-direction: column;
        gap: 18px;
        flex: 1;
      }
        .cajadescripcion {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 16px;
      }
        .block-label {
        display: flex;
        align-items: center;
        gap: 7px;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.8px;
        color: var(--gold);
        font-weight: 700;
        margin-bottom: 8px;
      }
        .descripciontexto {
        font-size: 14px;
        color: #CBD5E1;
        line-height: 1.55;
      }
        .detalles-grid {
        display: grid;
        grid-template-columns: 1.4fr 1fr;
        gap: 14px;
      }
        .detalles-card {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 14px 16px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
        .detalles-value {
        font-size: 13.5px;
        color: var(--text-main);
        line-height: 1.45;
        margin-bottom: 10px;
      }
        .btngugulmaps {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: var(--gold);
        font-size: 12px;
        font-weight: 600;
        text-decoration: none;
        width: fit-content;
        padding: 4px 8px;
        margin-left: -8px;
        border-radius: 6px;
        transition: 0.2s;
      }
        .btngugulmaps:hover {
        background: var(--gold-tint);
      }

      // EL OTRRO LADO DON ESTAN LOS COMENTARIOS

      .columna-comentarios{
        background: var(--bg-panel);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 20px;
        display: flex;
        flex-direction: column;
        height: calc(100vh - 102px);
        min-height: 540px;
      }

      .ecabezado-comentarios {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }
        .titulo-comentarios {
        font-size: 16px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 8px;
      }
        .badge-count {
        background: var(--gold-tint);
        color: var(--gold);
        padding: 2px 9px;
        border-radius: 99px;
        font-size: 12px;
        font-weight: 700;
      }

      .filtros-comentarios {
        display: flex;
        gap: 6px;
      }

      .boton-filtroComentarios {
        background: var(--bg-card);
        border: 1px solid var(--border);
        color: var(--text-muted);
        font-size: 11px;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: 6px;
        cursor: pointer;
        transition: 0.2s;
      }

      .boton-filtroComentarios.active, .boton-filtroComentarios:hover {
        border-color: var(--gold);
        color: var(--gold);
      }
        .disclaimer-note {
        font-size: 11.5px;
        color: var(--text-dim);
        background: rgba(20, 27, 45, 0.6);
        border-left: 2px solid var(--gold);
        padding: 8px 12px;
        border-radius: 0 6px 6px 0;
        margin-bottom: 14px;
      }
        .scrollcomentarios {
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding-right: 6px;
        margin-bottom: 14px;
      }
        .scrollcomentarios::-webkit-scrollbar { width: 5px; }
        .scrollcomentarios::-webkit-scrollbar-thumb {
        background: var(--border-active);
        border-radius: 4px;
      }

      .comentarios-item {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 13px 15px;
        transition: border-color 0.2s;
      }

      .comentarios-item:hover {
        border-color: var(--border-active);
      }

      .comentarios-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
      }

      .usuarioinfo {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .mini-avatar {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: var(--bg-hover);
        border: 1px solid var(--border-active);
        color: var(--gold);
        font-size: 11px;
        font-weight: 700;
        display: grid;
        place-items: center;
      }

      .usuario-name {
        font-size: 13px;
        font-weight: 700;
      }


      .comentariostiempo {
        font-size: 11px;
        color: var(--text-dim);
      }

      .comentario-body {
        font-size: 13.5px;
        color: #E2E8F0;
        line-height: 1.45;
        margin-bottom: 8px;
      }

      .comentario-actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .like-btn {
        background: transparent;
        border: none;
        color: var(--text-dim);
        font-size: 11.5px;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
        transition: 0.2s;
      }

      .like-btn:hover, .like-btn.active {
        color: var(--gold);
      }

      .comentario-composer {
        display: flex;
        gap: 10px;
        padding-top: 12px;
        border-top: 1px solid var(--border);
      }
        .comentario-composer input {
        flex: 1;
        background: var(--bg-card);
        border: 1px solid var(--border-active);
        color: var(--text-main);
        padding: 11px 16px;
        border-radius: 24px;
        font-size: 13.5px;
        outline: none;
        transition: 0.2s;
      }

      .comentario-composer input:focus {
        border-color: var(--gold);
      }

      .btn-publicar {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        background: var(--gold);
        color: #060911;
        border: none;
        display: grid;
        place-items: center;
        cursor: pointer;
        flex-shrink: 0;
        transition: 0.2s;
      }

      .btn-publicar:hover {
        background: var(--gold-light);
        transform: scale(1.05);
      }

      /* MODAL Y TOAST */
      .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.78);
        backdrop-filter: blur(4px);
        display: none;
        place-items: center;
        z-index: 100;
        padding: 16px;
      }

      .modal-overlay.active { display: grid; }

      .modal-card {
        background: var(--bg-panel);
        border: 1px solid var(--border-active);
        border-radius: 16px;
        width: 100%;
        max-width: 440px;
        padding: 24px;
      }
        .modal-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        color: var(--red);
        font-size: 17px;
        font-weight: 700;
      }
      `;
    document.head.appendChild(style);
}
      
