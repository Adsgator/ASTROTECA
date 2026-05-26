import { f as fetchRegistry, p as publishComponent } from '../../chunks/github_oIhC-tBw.mjs';
export { renderers } from '../../renderers.mjs';

const POST = async ({ request }) => {
  const { settings, meta, astroCode, previewCode, indexCode } = await request.json();
  try {
    const currentRegistry = await fetchRegistry(settings.registryUrl);
    await publishComponent(settings, { meta, astroCode, previewCode, indexCode, currentRegistry });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
