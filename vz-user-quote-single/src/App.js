import { useState, useEffect } from 'react';
import './App.scss';
import QuoteInput from 'components/quoteInput';
import language_strings from 'language';

function App() {
  const [quoteSlug, setQuoteSlug] = useState('new');
  const [protectEdit, setProtectEdit] = useState(false);
  const [userIsLoggedIn, setUserIsLoggedIn] = useState(false);
  const [nonce, setNonce] = useState('');
  const [companyDetails, setCompanyDetails] = useState({
    company_name: 'VZ Solutions',
    company_address_line_1: 'Calle 1',
    company_address_number: '123',
    company_address_line_2: 'Colonia',
    company_phone: '1234567890',
    company_email: 'contact@viroz.studio',
    company_website: 'https://viroz.studio',
    company_registration_number: '1234567890',
    company_logo: 'https://placehold.co/400x200',
    terms_and_conditions_text: '',
  });
  const [quote, setQuote] = useState({});
  const [language, setLanguage] = useState('es');
  const quoteDate = new Date().toLocaleDateString();
  const [productList, setProductList] = useState([{}]);
  const [responseMessage, setResponseMessage] = useState({
    type: '',
    message: '',
    title: '',
    ttl: 0,
  });
  const [clientDetails, setClientDetails] = useState({
    company: '',
    name: '',
    phone: '',
    email: '',
    address: '',
    fiscalCode: '',
  });
  const [loginOrRegister, setLoginOrRegister] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  
  function toggleLoginRegister() {
    setLoginOrRegister(loginOrRegister === 'login' ? 'register' : 'login');
  }

  const [quoteOptions, setQuoteOptions] = useState({
    subtotal: 0,
    vat: 0.08,
    total: 0, 
    privacy: 'private',
    password: '',
    notes: '',
  });

  function print() {
    window.print();
  }

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  function openPasswordModal() {
    setPasswordModalOpen(true);
  }

  useEffect(() => {

    if (window?.vz_user_quote?.quote_slug) {
      setQuoteSlug(window.vz_user_quote.quote_slug);
    }

    if(window.vz_user_quote?.language) {
      setLanguage(window.vz_user_quote.language);
    }

    if (window?.vz_user_quote?.is_logged_in) {
      setUserIsLoggedIn(true);
    }

    if (window?.vz_user_quote?.locked) {
      openPasswordModal();
    }
    if (!window?.vz_user_quote?.current_user_can_edit) {
      console.log('User cannot edit');
      setProtectEdit(true);
    }
    
    if (window?.vz_user_quote?.nonce) {
      setNonce(window.vz_user_quote.nonce);
    }

    if (window?.vz_user_quote?.company_details) {
      setCompanyDetails(window.vz_user_quote.company_details);
    }
    if (Array.isArray(window?.vz_user_quote?.products)) {
      setProductList(window.vz_user_quote.products);
    }
    if (window?.vz_user_quote?.client_details && typeof window?.vz_user_quote?.client_details === 'object') {
      setClientDetails(window.vz_user_quote.client_details);
    }
    if (window?.vz_user_quote?.options) {
      const vatNumber = window?.vz_user_quote?.company_details?.company_vat_number;
      const quoteOptions = window.vz_user_quote.options;
      if (!isNaN(vatNumber)) {
        quoteOptions.vat = vatNumber;
      }
      setQuoteOptions(quoteOptions);
    }

    if (window?.vz_user_quote?.quote) {
      setQuote(window.vz_user_quote.quote);
    }

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('success')) {
      activateResponseMessage(_('success'), _('saved-changes-success'), 'success');
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (window?.vz_user_quote?.quote_was_sent === true) {
      console.log('Quote was sent');
      setProtectEdit(true);
    }

    const localStorageCopy = localStorage.getItem('quote');
    if (localStorageCopy && window?.vz_user_quote.quote_slug === 'new') {
      loadCopyFromLocalStorage();
    }

  }, [window]);

  const [closeResponseMessageAnimationTimeout, setCloseResponseMessageAnimationTimeout] = useState(null);
  function activateResponseMessage(title, message, type = 'info', ttl = 5) {
    setResponseMessage({ title, message, type, ttl });
    setCloseResponseMessageAnimationTimeout(
      setTimeout(() => {
        closeResponseMessage();
      }, ttl * 1000)
    );
  }

  const [closeResponseMessageAnimation, setCloseResponseMessageAnimation] = useState(false);
  function closeResponseMessage() {
    setCloseResponseMessageAnimation(true);
    setCloseResponseMessageAnimationTimeout(null);
    setTimeout(() => {
      setResponseMessage({});
      setCloseResponseMessageAnimation(false);
    }, 500);
  }

  function copyShareLink() {
    const shareLink = document.querySelector('.vz-quote__share-link > input');
    shareLink.select();
    document.execCommand('copy');
    activateResponseMessage(_('success'), _('link-copied'), 'success');
  }

  function getQuoteLink() {
    const url = window.location.href;
    // remove any query parameters
    const urlParts = url.split('?');
    return urlParts[0];
  }
  function _(string) {
    if (language_strings[string] && language_strings[string][language]) {
      return language_strings[string][language];
    } else {
      return string;
    }
  }

  function addProduct() {
    addProductAtIndex(-1);
  }

  function addProductAtIndex(idx) {
    const productTemplate = {
      id: null,
      sku: '',
      name: '',
      description: '',
      price: 0,
      quantity: 1,
    };
    const newProductList = [...productList];
    newProductList.splice(idx + 1, 0, productTemplate);
    setProductList(newProductList);
    // set the focus on the new products name input
    setTimeout(() => {
      console.log('Setting focus on new product input');
      // .input-group.input__product-name > input
    const productList = document.querySelectorAll('.product-list__item');
    const newProduct = productList[idx + 1];
    const input = newProduct.querySelector('.input__product-name > input');
    input.focus();
    }, 100);
    
  }

  function removeProduct(idx) {
    return () => {
      const newProductList = productList.filter((product, index) => index !== idx);
      setProductList(newProductList);
    }
  }

  function copyFromWoocommerce() {
    if (!window?.vz_user_quote?.woocommerce_cart_contents) {
      console.error('No woocommerce cart contents found');
      activateResponseMessage(_('Error'), _('error-copying-products'), 'error');
      return;
    }
    const woocommerceCartContents = window.vz_user_quote.woocommerce_cart_contents;
    const newProductList = woocommerceCartContents.map((product) => {
      return {
        id: product.id,
        sku: product.sku,
        name: product.name,
        description: "",
        price: product.price,
        quantity: product.quantity,
      };
    });
    const oldProductList = productList;
    setProductList([...oldProductList, ...newProductList]);
  }

  async function saveChanges( send = false ) {
    if (protectEdit) {
      activateResponseMessage(_('error'), _('error-quote-already-sent'), 'error');
      return;
    }

    const rest_url = window?.vz_user_quote?.rest_url;
    const quoteSlug = window?.vz_user_quote?.quote_slug;

    if (!rest_url || !nonce || !quoteSlug) {
      console.error('No rest_url, nonce or quote_slug found', { rest_url, nonce, quoteSlug });
      activateResponseMessage(_('error'), _('error-saving-quote'), 'error');
      return;
    }
    const params = {
      quote_slug: quoteSlug,
      products: productList,
      client: clientDetails,
      nonce: nonce,
      options: {
        ...quoteOptions,
        subtotal: getSubtotal(),
        total: getTotal() 
      }
    }

    if (send) {
      params.send = true;
    }

    try {
      const fetchUrl = `${rest_url}vz-user-quotes/v1/save-quote`;
      const response = await fetch(fetchUrl, {
        method: 'POST',
        body: JSON.stringify(params),
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonce,
        },
      });
      const data = await response.text();
      const jsonData = JSON.parse(data);
      if(jsonData.status === 'success'  && quoteSlug === 'new') {
        const newPostLocation = `${window.location.origin}/vz-user-quotes/${jsonData.quote_slug}?success`;
        window.location.href = newPostLocation;
      } else if(jsonData.status === 'success') {
        activateResponseMessage(_('success'), _('success-changes-saved'), 'success');
      } else if(jsonData.status === 'error') {
        console.log(jsonData);
        activateResponseMessage(_('error'), _('error-saving-changes'), 'error');
      }
    } catch (error) {
      activateResponseMessage('Error', _('error-saving-changes'), 'error');
      console.error(error);
    }
  }

  function isValidAuthorName(authorName) {
    return authorName && authorName !== '';
  }

  function saveCopyAtLocalStorage()  {
    const quote = {
      companyDetails,
      clientDetails,
      productList,
      quoteOptions,
    };
    localStorage.setItem('quote', JSON.stringify(quote));
  }

  function loadCopyFromLocalStorage() {
    const quote = localStorage.getItem('quote');
    if (quote) {
        const quoteJson = JSON.parse(quote);
        setCompanyDetails(quoteJson.companyDetails);
        setClientDetails(quoteJson.clientDetails);
        setProductList(quoteJson.productList);
        setQuoteOptions(quoteJson.quoteOptions
      );
      deleteCopyFromLocalStorage();
    }
  }

  function deleteCopyFromLocalStorage() {
    localStorage.removeItem('quote');
  }

  function sendQuote() {
    if(window.confirm(_('send-quote-confirm'))) {
      saveChanges(true);
    }
  }

  async function login() {
    saveCopyAtLocalStorage();
    const rest_url = window?.vz_user_quote?.rest_url;
    const fetchUrl = `${rest_url}vz-user-quotes/v1/login`;
    const params = {
      username: username,
      password: password,
    }
    try {
      const result = await fetch(fetchUrl, {
        method: 'POST',
        body: JSON.stringify(params),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const resultText = await result.text();
      const resultJson = JSON.parse(resultText);
      console.log(resultJson);
      if (resultJson.status === 'success') {
        activateResponseMessage(_('success'), _('registration-success'), 'success');
        setUserIsLoggedIn(true);
        const nonce = resultJson.wp_rest_nonce;
        setNonce(nonce);
        setCookies(resultJson);
        window.location.reload();
      } else {
        activateResponseMessage(_('error'), resultJson.message, 'error');
      }
    } catch(error) {
      console.error(error);
      activateResponseMessage(_('error'), _('error-logging-in'), 'error');
    }
  }

  async function setCookies(resultJson) {
    const cookieParams = {
      'username': resultJson.username,
      'email': resultJson.email,
      'nonce': resultJson.wp_rest_nonce,
    }
    const cookieString = Object.keys(cookieParams).map((key) => {
      return `${key}=${cookieParams[key]}`;
    }).join(';');
    document.cookie = cookieString;
  }

   async function register() {
    saveCopyAtLocalStorage();
    const rest_url = window?.vz_user_quote?.rest_url;
    const fetchUrl = `${rest_url}vz-user-quotes/v1/register`;
    if (password !== userPassword) {
      console.error('Passwords do not match');
      activateResponseMessage(_('error'), _('password-dont-match'), 'error');
      return;
    }
    const params = {
      username: username,
      email: userEmail,
      password: userPassword,
    }
    try {
      const result = await fetch(fetchUrl, {
        method: 'POST',
        body: JSON.stringify(params),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const resultText = await result.text();
      const resultJson = JSON.parse(resultText);
      console.log(resultJson);
      if (resultJson.status === 'success') {
        setUserIsLoggedIn(true);
        activateResponseMessage(_('success'), _('registration-success'), 'success');
        const nonce = resultJson.wp_rest_nonce;
        setNonce(nonce);
        setCookies(resultJson);
        window.location.reload();
      } else {
        activateResponseMessage(_('error'), resultJson.message, 'error');
      }
    } catch(error) {
      console.error(error);
      activateResponseMessage(_('error'), _('error-registrating'), 'error');
    }
   }


  function updateProduct(idx, key, value) {
    const newProductList = productList.map((product, index) => {
      if (index === idx) {
        return { ...product, [key]: value };
      }
      return product;
    });
    setProductList(newProductList);
  }

  function getSubtotal() {
    return productList.reduce((acc, product) => acc + (product.price * product.quantity), 0);
  }

  function getTotal() {
    const subtotal = getSubtotal();
    const vat = quoteOptions.vat;
    return subtotal + vat * subtotal;
  }

  function formatMoney(value) {
    const v = parseFloat(value) || 0;
    return new Intl.NumberFormat('en-US', 
      { style: 'currency', currency: 'USD' }
    ).format(v);
  }

  const pageNavigationOptions = [
    {
      title: _('contact-information'),
      component: 'ContactInformation',
    },
    {
      title: _('products'),
      component: 'Products',
    },
    {
      title: _('options'),
      component: 'Options',
    },
  ];

  function nextStepInPage() {
    const currentIndex = pageNavigationOptions.findIndex((option) => option.component === activePage);
    const nextIndex = currentIndex + 1;
    if (nextIndex < pageNavigationOptions.length) {
      setActivePageComponent(pageNavigationOptions[nextIndex].component);
    } else {
      saveChanges();
    }
  }

  const [activePage, setActivePage] = useState('ContactInformation');

  function setActivePageComponent(component) {
    setActivePage(component);
  }

  const [easyMode, setEasyMode] = useState(true);


  function goBack() {
    window.history.back();
  }

  return (
    <main className="vz-quote">
      <header className="vz-quote__header">
        <section className="vz-quote__company-logo">
          <button className="vz-quote__back-button" onClick={() => goBack()}>
            <img src={companyDetails.company_logo}
                alt={companyDetails.company_name} />
          </button>
        </section>
        <section className="vz-quote__company-details">
          <h2 className="company-name">
            {companyDetails.company_name}
          </h2>
          <div className="company-contact">
            <p>{companyDetails.company_phone}</p>
            <p>{companyDetails.company_email}</p>
            <p>{companyDetails.company_website}</p>
          </div>
          <div className="company-address">
            <p>{companyDetails.company_address_line_1} {companyDetails.company_address_number}</p>
            <p>{companyDetails.company_address_line_2}</p>
            <p className="company-company_registration_number">
              <b>
                { _('company-registration-number') }
              </b>
              {companyDetails.company_registration_number}
            </p>
          </div>
        </section>
        <div className="vz-quote__actions">
          <button className="button btn-secondary" onClick={() => saveChanges()}>
            {_('save-changes')}
          </button>
          <label>
            <input type="checkbox" />
            { companyDetails.terms_and_conditions_text === '' &&
              _('terms-and-conditions') }
            { companyDetails.terms_and_conditions_text !== '' &&
              <span dangerouslySetInnerHTML={{__html: companyDetails.terms_and_conditions_text}}></span> }
          </label>
        </div>
      </header>
      <div className="user-details__wrapper">
      { !userIsLoggedIn &&
        <section className="user-details">
          <div className="user-details__header">
            <h2>{_('login-register-title')}</h2>
            <p>
              {_('login-register-message')}
            </p>
          </div>
          {
            loginOrRegister === 'login' &&
            <div className="login">
              <div className="vz-quote__products-header">
                <h3>{_('login-header')}</h3>
                <p className='toggle-login-register'>
                    {_('register-instead')} <button className="link" onClick={() => toggleLoginRegister()}>{_('register-button')}</button>
                </p>
              </div>
              <div className="inline-fields">
                <QuoteInput type="text" 
                            title={_('username')} 
                            onChange={(e) => setUsername(e)} />
                <QuoteInput type="password" 
                            title={_('password')} 
                            onChange={(e) => setPassword(e)} />
                <button className="button btn-" onClick={() => login()}>
                  {_('login-button')}
                </button>
              </div>
              
            </div>
          }
          {
            loginOrRegister === 'register' &&
            <div className="register">

              <div className="vz-quote__products-header">
                <h3>{_('register-header')}</h3>
                <p className='toggle-login-register'>
                  {_('login-instead')} <button className="link" onClick={() => toggleLoginRegister()}>{_('login-button')}</button>
                </p>
              </div>
              <div className="inline-fields">
                <QuoteInput type="text" 
                            title={_('username')} 
                            onChange={(e) => setUsername(e)} />
                <QuoteInput type="text" 
                            title={_('email')} 
                            onChange={(e) => setUserEmail(e)} />
                <QuoteInput type="password" 
                            title={_('password')} 
                            onChange={(e) => setPassword(e)} />
                <QuoteInput type="password" 
                            title={_('repeat-password')} 
                            onChange={(e) => setUserPassword(e)} />
                <button className="button btn-" onClick={() => register()}>
                  {_('register-button')}
                </button>
              </div>
            
            </div>
          }
        </section>
      }
      </div>

      <nav className="vz-quote__section-navigation">
        <ul>
          { pageNavigationOptions.map((option, index) => (
              <li key={index}>
                <button className={activePage === option.component ? '--active' : ''}
                        onClick={() => setActivePageComponent(option.component)}>
                  {option.title}
                </button>
              </li>
            )) }
        </ul>
      </nav>
      { activePage === 'ContactInformation' &&
        <section className="client-details">
          <h2>{_('client-details')}</h2>
          {
            Object.keys(clientDetails).map((key, index) => (
              <QuoteInput key={index} 
                          type="text" 
                          title={_(key)} 
                          value={clientDetails[key]}
                          onChange={(e) => setClientDetails({ ...clientDetails, [key]: e })} />
            ))
          }
        </section>
      }
      
      {
        activePage === 'Products' &&
        <section className="vz-quote__products">
          <div className="vz-quote__products-header">
            <h2>{_('products')}</h2>

            <button className={"toggle-easy-mode " + (easyMode ? '--active' : '')}
                    onClick={() => setEasyMode(!easyMode)}>
              { easyMode ? _('advanced-mode') : _('easy-mode') }
            </button>

            { window?.vz_user_quote?.woocommerce &&
              <button className="button btn-secondary" onClick={() => copyFromWoocommerce()}>
                {_('add-from-woocommerce')}
              </button>
            }
            
            <button className="button btn-secondary" onClick={() => addProduct()}>
              + {_('add-product')}
            </button>
          </div>
          <ol className="product-list">
            {
              productList.length === 0 &&
              <li className="product-list__item">
                <p>{_('add-product-to-start')}</p>
              </li>
            }
            {
              productList.map((product, index) => (
                <li key={index} className="product-list__item">
                  <article className="product-card">
                    <span className="product-list__number">
                      {index + 1}
                    </span>
                    <div className="product-details">
                      <QuoteInput type="text" 
                                  title={_('name')} 
                                  value={product.name}
                                  className="input__product-name"
                                  onChange={(e) => updateProduct(index, 'name', e)} />
                      <QuoteInput type="number"
                                  className="input__product-quantity"
                                  title={_('quantity')}
                                  value={product.quantity}
                                  onChange={(e) => updateProduct(index, 'quantity', e)} />
                      {!easyMode &&
                      <QuoteInput type="text"
                                  title={_('description')}
                                  className="product-description"
                                  value={product.description}
                                  onChange={(e) => updateProduct(index, 'description', e)} />
                      }
                      {!easyMode &&
                      <QuoteInput type="number"
                                  title={_('price')}
                                  className="product-price"
                                  value={product.price}
                                  onChange={(e) => updateProduct(index, 'price', e)} /> 
                      }
                      {!easyMode &&
                      <QuoteInput type="text" 
                                  title={_('sku')} 
                                  value={product.sku}
                                  onChange={(e) => updateProduct(index, 'sku', e)} />
                      }
                    </div>
                    {
                      !easyMode &&
                      <p className="product-subtotal"> { formatMoney(product.price * product.quantity) } </p>
                    }
                    <div className="product-actions">
                      <button className="button-add-after" onClick={() => addProductAtIndex(index)}>
                        {_('add-product')}
                      </button>
                      <button className="button-remove" onClick={removeProduct(index)}>
                        {_('remove')}
                      </button>
                    </div>
                  </article>
                </li>
              ))
            }
          </ol>

          <section className="vz-quote__totals">
            <div className="vz-quote__subtotal">
              <h3>{_('subtotal')}</h3>
              <p>{formatMoney(getSubtotal())}</p>
            </div>

            <div className="vz-quote__vat">
              <h3>{_('vat')}</h3>
              <p>{quoteOptions.vat * 100}%</p>
            </div>

            <div className="vz-quote__total">
              <h2>{_('total')}</h2>
              <p>{formatMoney(getTotal())}</p>
            </div>
          </section>
        </section>
      }

      { activePage === 'Options' &&
        <section className="vz-quote__options">
          <h2>{_('options')}</h2>



          {window?.vz_user_quote?.can_edit_vat &&
          <QuoteInput type="number"
                      title={_('vat')}
                      value={quoteOptions.vat * 100}
                      onChange={(e) => setQuoteOptions({ ...quoteOptions, vat: e / 100 })} />
                      
          }
          <QuoteInput type="textarea"
                      title={_('notes')}
                      value={quoteOptions.notes}
                      onChange={(e) => setQuoteOptions({ ...quoteOptions, notes: e })} />
          <div className="privacy-options">
            <div className="vz-quote__share-link">
              <input type="text"
                      disabled
                     value={getQuoteLink()} />
              <button className="button btn-primary" onClick={() => copyShareLink()}>
                {_('copy-link')}
              </button>
            </div>
            {('undefined' !== typeof quoteSlug && quoteSlug === 'new') &&
              <p className="save-before-sharing-message">
                {_('save-before-sharing')}
              </p>
            }
            <h4>
              {_('quote-privacy-header')}
            </h4>
            <label>
              <input type="radio" 
                    checked={quoteOptions.privacy === 'public'} 
                    value="public"
                    onChange={(e) => setQuoteOptions({ ...quoteOptions, privacy: 'public' })} />
              {_('anyone-with-link')}
            </label>
            <label>
              <input type="radio" 
                    checked={quoteOptions.privacy === 'password'} 
                    value="password"
                    onChange={(e) => setQuoteOptions({ ...quoteOptions, privacy: 'password' })} />
              {_('password-protected')}
            </label>
            {quoteOptions.privacy === 'password' &&
            <QuoteInput type="password" 
                        title={_('password')} 
                        onChange={(e) => setQuoteOptions({ ...quoteOptions, password: e })} />
            }
            <label>
              <input type="radio" 
                    checked={quoteOptions.privacy === 'private'} 
                    value="private"
                    onChange={(e) => setQuoteOptions({ ...quoteOptions, privacy: "private" })} />
              {_('private')}
            </label>
          </div>
        </section>
      }

      <footer className="vz-quote__footer">
        <button className={'button btn-next-step' +
          (activePage === 'Options' ? ' --save-changes' : '')
        } onClick={() => nextStepInPage()}>
          {activePage === 'Options' && _('save-changes')}
          {activePage !== 'Options' && _('next-step')}
        </button>
      </footer>

      { responseMessage.title &&
        <article className={
          `response-message --${responseMessage.type} ${closeResponseMessageAnimation ? '--closing' : ''}`
        }>
          <h3>
            {responseMessage.title}
          </h3>
          <p>
            {responseMessage.message}
          </p>
          <button class="btn-close" 
                  onClick={() => closeResponseMessage()}>
            ✕
          </button>
        </article>
      }

      { passwordModalOpen &&
        <article className="password-modal">
          <form method="post">
            <h2>
              {_('password-protected')}
            </h2>
            <p>
              {_('password-protected-message')}
            </p>
            <QuoteInput type="password" 
                        title={_('password')} 
                        onChange={(e) => setQuoteOptions({ ...quoteOptions, password: e })} />
            <input type="hidden"
                    value = {quoteOptions.password}
                    name="vz-quote-password" />
            <button className="button btn-" onClick={() => saveChanges()}>
              {_('unlock')}
            </button>
          </form>
        </article>
      }
    </main>
  );
}

export default App;
