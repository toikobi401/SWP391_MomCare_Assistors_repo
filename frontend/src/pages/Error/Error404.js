export const Error404Page = () => {
  return (
    <>
      <section className="section-area section-sp2 error-404">
        <div className="container">
          <div className="inner-content">
            <h2 className="error-title">404</h2>
            <h3 className="error-text">The Page you were looking for, couldn't be found.</h3>
            <p>The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
            <div className="clearfix">
              <a href="/" className="btn btn-primary">Back To Home</a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}