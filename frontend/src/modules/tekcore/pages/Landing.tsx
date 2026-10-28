import { createResource } from "solid-js";
import { loadContent } from "../lib/api";
import Hero from "../components/Hero";
import About from "../components/About";
import Formats from "../components/Formats";
import Actions from "../components/Actions";
import Vacancy from "../components/Vacancy";
import Footer from "../components/Footer";

export default function Landing() {
  const [content] = createResource(loadContent);
  return (
    <>
      <Hero />
      <About />
      <Formats />
      <Actions products={content()?.products} />
      <Vacancy districts={content()?.districts} />
      <Footer />
    </>
  );
}