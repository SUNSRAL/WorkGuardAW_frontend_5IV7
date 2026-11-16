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
        background-color: rgba(11, 22, 44, 0.9); /* Azul oscuro de WorkGuard */
        --bg-base: #060911;
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

      }`;
    document.head.appendChild(style);
}
      
