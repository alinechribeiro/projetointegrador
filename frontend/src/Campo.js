function Campo({ rotulo, erro, children }) {
  return (
    <div className="campo">
      <label>
        {rotulo}
        {children}
      </label>
      {erro && <span className="erro">{erro}</span>}
    </div>
  );
}

export default Campo;
