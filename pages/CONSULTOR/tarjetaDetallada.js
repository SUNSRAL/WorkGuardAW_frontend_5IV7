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

      .demo-switcher {
        display: flex;
        align-items: center;
        gap: 8px;
        background: var(--bg-card);
        border: 1px solid var(--border);
        padding: 5px 12px;
        border-radius: 8px;
        font-size: 12px;
        color: var(--text-muted);
      }

      .demo-switcher select {
        background: transparent;
        border: none;
        color: var(--gold);
        font-weight: 700;
        font-size: 12px;
        outline: none;
        cursor: pointer;
      }

      .demo-switcher select option {
        background: var(--bg-panel);
        color: var(--text-main);
      }

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

      `;
    document.head.appendChild(style);
}
      
