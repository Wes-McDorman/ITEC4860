import { GgcRmpPage } from './app.po';

describe('ggc-rmp App', function() {
  let page: GgcRmpPage;

  beforeEach(() => {
    page = new GgcRmpPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
