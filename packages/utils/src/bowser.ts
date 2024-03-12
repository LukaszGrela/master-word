import Bowser from 'bowser';

export const getBowserDetails = (): Bowser.Parser.ParsedResult => {
  const parser = Bowser.getParser(window.navigator.userAgent);
  return parser.getResult();
};

const makeClassFriendly = (input: string): string => {
  return input.replace(/\s/g, '_');
};

export const applyBowserClass = (html: HTMLHtmlElement): void => {
  const result = getBowserDetails();

  if (result.os.name) {
    html.classList.add(makeClassFriendly(result.os.name));
    if (result.os.version) {
      html.classList.add(
        makeClassFriendly(`${result.os.name}-${result.os.version}`),
      );
    }
  }

  if (result.browser.name) {
    html.classList.add(makeClassFriendly(result.browser.name));
  }

  if (result.platform.type) {
    html.classList.add(makeClassFriendly(result.platform.type));
  }
  if (result.platform.vendor) {
    html.classList.add(makeClassFriendly(result.platform.vendor));
  }
  if (result.platform.model) {
    html.classList.add(makeClassFriendly(result.platform.model));
  }
};
