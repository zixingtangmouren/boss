import Versions from './components/Versions';
import electronLogo from './assets/electron.svg';
import { PROCESSES_NAME } from '../../common/constants';
import { useCounterStore } from './store/couterStore';

function App(): React.JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping');

  const openChatWindow = (): void => {
    window.api.windowService.openWindow(PROCESSES_NAME.CHAT_WINDOW);
  };

  const queryDatabase = async () => {
    const res = await window.api.dbService.query('models', {
      modelName: 'gpt-4o',
      id: '09f8680c-e7e9-49e7-93d9-546ff1325791'
    });
    console.log('res >>>', res);
  };

  const getAllWindows = async (): Promise<void> => {
    const res = await window.api.windowService.getAllWindows();
    console.log('res >>>', res);
  };

  const { counter, increase, decrease } = useCounterStore();

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
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={queryDatabase}>
            查询数据库
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={getAllWindows}>
            获取所有窗口
          </a>
        </div>
      </div>
      <div>
        <button onClick={increase}>Increase</button>
        <button onClick={decrease}>Decrease</button>
        <p>Counter: {counter}</p>
      </div>
      <Versions></Versions>
    </>
  );
}

export default App;
