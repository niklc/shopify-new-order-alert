import type { NextPage } from 'next';
import React from 'react';

const LoginPage: NextPage = () => {
  const [keyValue, setKey] = React.useState('');

  function login() {
    document.cookie = `key=${keyValue};max-age=604800`;

    window.location.assign('/');
  }

  return (
    <div className="container">
      <div className="column is-offset-one-third is-one-third is-flex is-flex-direction-column is-justify-content-center">
        <div className="box">
          <div className="field">
            <div className="control">
              <input
                className="input"
                placeholder="Key"
                value={keyValue}
                onChange={event => setKey(event.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <div className="control has-text-centered">
              <button
                onClick={login}
                className="button is-success"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        html, body, body > div:first-child, .container, .column {
            height: 100%;
        }
      `}</style>
    </div>
  )
}

export default LoginPage;
