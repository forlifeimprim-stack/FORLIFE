import { Component, type ErrorInfo, type ReactNode } from "react";

/**
 * Filet de sécurité de l'interface : une erreur d'affichage ne laisse jamais une page blanche.
 * Le détail technique est affiché pour pouvoir être transmis au support.
 */
export class ErrorBoundary extends Component<{ children: ReactNode; resetKey?: string }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Erreur d'affichage", error, info.componentStack);
  }

  componentDidUpdate(prev: { resetKey?: string }) {
    // Changer de page efface l'erreur.
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div className="card" role="alert" style={{ maxWidth: 640 }}>
        <h2>Cette page n'a pas pu s'afficher</h2>
        <p>Rechargez la page. Si le problème persiste, envoyez une capture de ce message au support Forlife Com.</p>
        <p className="small muted" style={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
          {error.name} : {error.message}
          {"\n"}
          {navigator.userAgent}
        </p>
        <div className="row">
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Recharger la page
          </button>
          <a className="btn btn-secondary" href="/">
            Retour à l'accueil
          </a>
        </div>
      </div>
    );
  }
}
