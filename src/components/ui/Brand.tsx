import './brand.css'

/** Shared vector lockup; the enclosing home link supplies its accessible name. */
export default function Brand() {
  return <span className="brand-lockup" aria-hidden="true">
    <img className="brand-light" src="/brand/hovie.svg" width="216" height="40" alt="" />
    <img className="brand-dark" src="/brand/hovie-dark.svg" width="216" height="40" alt="" />
  </span>
}
