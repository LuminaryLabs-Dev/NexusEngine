export function createTargetValidationService() {
  async function validate(provider, context) {
    const result = await provider.validate(context);
    if (!result || typeof result.ok !== "boolean") {
      throw new TypeError(`Build target ${provider.id} returned an invalid validation result.`);
    }
    return Object.freeze(result);
  }

  return Object.freeze({ validate });
}

export default createTargetValidationService;
