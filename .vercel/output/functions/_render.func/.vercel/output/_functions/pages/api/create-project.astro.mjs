import { c as createProjectFromTemplate } from '../../chunks/github_B0bVnyLs.mjs';
export { renderers } from '../../renderers.mjs';

const POST = async ({ request }) => {
  const { settings, clientName, manifest } = await request.json();
  const result = await createProjectFromTemplate(settings, clientName, manifest);
  if (!result.success) {
    return new Response(JSON.stringify({ error: result.error }), { status: 400 });
  }
  return new Response(JSON.stringify(result), { status: 200 });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
