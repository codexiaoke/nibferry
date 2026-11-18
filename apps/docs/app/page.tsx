import { ThemePreview } from '../components/ThemePreview';

export default function Home() {
  return (
    <main className="page">
      <div className="intro">
        <h1>任务输入与决策</h1>
        <p>在同一个输入区交代任务、查看进度，并在 Agent 需要选择时接手。</p>
      </div>
      <ThemePreview />
    </main>
  );
}
