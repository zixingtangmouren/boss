import Versions from './components/Versions';
import electronLogo from './assets/electron.svg';
import { useEffect } from 'react';
import { WINDOWS_NAME } from '../../common/constants';

function App(): React.JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping');

  const openChatWindow = (): void => {
    window.api.openWindow(WINDOWS_NAME.CHAT_WINDOW);
  };

  useEffect(() => {
    console.log('window.renderIpcService >>>', window.renderIpcService);
  }, []);

  return (
    <>
      <img alt="logo" className="logo" src={electronLogo} />
      <div className="creator">Powered by electron-vite</div>
      <div className="text">
        Build an Electron app with <span className="react">React</span>
        &nbsp;and <span className="ts">TypeScript</span>
      </div>
      <p className="tip">
        Please try pressing <code>F12</code> to open the devTool
      </p>
      <div className="actions">
        <div className="action">
          <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">
            Documentation
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={ipcHandle}>
            Send IPC
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={openChatWindow}>
            打开聊天
          </a>
        </div>
      </div>
      <Versions></Versions>
    </>
  );
}

export default App;
