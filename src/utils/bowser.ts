import Bowser from 'bowser';

export const getBowserDetails = (): Bowser.Parser.ParsedResult => {
  const parser = Bowser.getParser(window.navigator.userAgent);
  return parser.getResult();
};

export const applyBowserClass = (html: HTMLHtmlElement): void => {
  const result = getBowserDetails();

  if (result.os.name) {
    html.classList.add(result.os.name);
    if (result.os.version) {
      html.classList.add(`${result.os.name}-${result.os.version}`);
    }
  }

  if (result.browser.name) {
    html.classList.add(result.browser.name);
  }

  if (result.platform.type) {
    html.classList.add(result.platform.type);
  }
  if (result.platform.vendor) {
    html.classList.add(result.platform.vendor);
  }
  if (result.platform.model) {
    html.classList.add(result.platform.model);
  }
};
