import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function App() {
  return (
    <main className="page">
      <header className="header">
        <div className="brand-mark">SGC</div>
        <div>
          <p className="eyebrow">SEPLAG · SUPERINTENDÊNCIA ADMINISTRATIVA</p>
          <h1>Sistema de Gestão de Contratos</h1>
        </div>
      </header>
      <section className="welcome">
        <p className="eyebrow">MVP · AMBIENTE DE DESENVOLVIMENTO</p>
        <h2>Base do projeto criada</h2>
        <p>O ambiente inicial está preparado. As próximas entregas serão autenticação, cadastro e acompanhamento dos contratos.</p>
        <span className="status"><i /> Estrutura inicial</span>
      </section>
      <footer>SGC — SEPLAG/AL · Projeto Extensionista IFAL</footer>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
