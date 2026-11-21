import type { Metadata } from 'next';
import PlaygroundDesktop from './PlaygroundDesktop';
import { getSearchIndex } from '../../lib/docs';
import './playground.css';

export const metadata: Metadata = { title: '交互预览 · Nibferry' };

export default function PlaygroundPage() {
  return <PlaygroundDesktop searchEntries={getSearchIndex()} />;
}
