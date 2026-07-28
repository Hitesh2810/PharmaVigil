import { Hero } from './home/Hero';
import { Features } from './home/Features';
import { Workflow } from './home/Workflow';
import { Stats } from './home/Stats';
import { Technologies } from './home/Technologies';

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Workflow />
      <Stats />
      <Technologies />
    </>
  );
}
