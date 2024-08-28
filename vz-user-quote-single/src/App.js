import { useState, useEffect } from 'react';
import './App.scss';
import QuoteInput from 'components/quoteInput';
import language_strings from 'language';

function App() {
  let vz_user_quote = {
    quote_slug: 'new',
    nonce: '',
    rest_url: '',
    createdAt: new Date().toLocaleDateString(),
    author_name: 'VZ Solutions',
    last_edit: new Date().toLocaleDateString(),
  };
  const [companyDetails, setCompanyDetails] = useState({
    company_name: 'VZ Solutions',
    company_address_line_1: 'Calle 1',
    company_address_number: '123',
    company_address_line_2: 'Colonia',
    company_phone: '1234567890',
    company_email: 'contact@viroz.studio',
    company_website: 'https://viroz.studio',
    company_registration_number: '1234567890',
    //. company_logo: 'https://placekitten.com/400/200',
    company_logo: 'https://placehold.co/400x200',
    terms_and_conditions_text: '',
  });
  const [quote, setQuote] = useState({});
  const language = 'es';
  const quoteDate = new Date().toLocaleDateString();
  const [productList, setProductList] = useState([{}]);
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


  useEffect(() => {
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
    console.log(window.vz_user_quote);
  }, [window]);

  function _(string) {
    if (!language_strings[string])
      return string;
    if (!language_strings[string][language])
      return string;
    else 
      return language_strings[string][language];
  }

  function addProduct() {
    const productTemplate = {
      id: null,
      sku: '',
      name: '',
      description: '',
      price: 0,
      quantity: 0,
    };
    setProductList([...productList, productTemplate]);
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

  async function saveChanges() {
    const rest_url = window?.vz_user_quote?.rest_url;
    const nonce = window?.vz_user_quote?.nonce;
    const quoteSlug = window?.vz_user_quote?.quote_slug;

    if (!rest_url || !nonce || !quoteSlug) {
      console.error('No rest_url found');
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
      if(jsonData.status == 'success'  && quoteSlug == 'new') {
        const newPostLocation = `${window.location.origin}/vz-user-quotes/${jsonData.quote_slug}`;
        window.location.href = newPostLocation;
      }
    } catch (error) {
      console.error(error);
    }
  }

  function sendQuote() {
    saveChanges();
  }

  function login() {

  }

   function register() {
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

  return (
    <main className="vz-quote">
      <header className="vz-quote__header">
        <section className="vz-quote__company-logo">
          <img src={companyDetails.company_logo} alt={companyDetails.company_name} />
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
          <button className="button btn-secondary" onClick={() => print()}>
            {_('print')}
          </button>
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

      <section className="user-details">
        {
          loginOrRegister === 'login' &&
          <div className="login">
            <div className="vz-quote__products-header">
              <h2>{_('login-header')}</h2>
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
              <h2>{_('register-header')}</h2>
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
      
      <section className="vz-quote__products">
        <div className="vz-quote__products-header">
          <h2>{_('products')}</h2>
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
                                title={_('sku')} 
                                value={product.sku}
                                onChange={(e) => updateProduct(index, 'sku', e)} />
                    <QuoteInput type="text" 
                                title={_('name')} 
                                value={product.name}
                                onChange={(e) => updateProduct(index, 'name', e)} />
                    <QuoteInput type="text"
                                title={_('description')}
                                className="product-description"
                                value={product.description}
                                onChange={(e) => updateProduct(index, 'description', e)} />
                    <QuoteInput type="number"
                                title={_('price')}
                                value={product.price}
                                onChange={(e) => updateProduct(index, 'price', e)} /> 
                    <QuoteInput type="number"
                                title={_('quantity')}
                                value={product.quantity}
                                onChange={(e) => updateProduct(index, 'quantity', e)} />  
                  </div>
                  <p className="product-subtotal"> { formatMoney(product.price * product.quantity) } </p>
                  <div className="product-actions">
                    <button className="button-remove" onClick={removeProduct(index)}>
                      {_('remove')}
                    </button>
                  </div>
                </article>
              </li>
            ))
          }
        </ol>
      </section>

      <div className="split-container">        
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
          <h4>
            {_('quote-privacy-header')}
          </h4>
          <label>
            <input type="radio" 
                  checked={quoteOptions.privacy == 'public'} 
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
                  checked={quoteOptions.privacy == 'private'} 
                  value="private"
                  onChange={(e) => setQuoteOptions({ ...quoteOptions, privacy: "private" })} />
            {_('private')}
          </label>
        </div>
      </section>
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

          <button className="button btn-full" onClick={() => sendQuote()}>
            {_('send-quote')}
          </button>

        </section>
        <section className="vz-quote__author">
            <h2>
              {_('last-edit-by')}
            </h2>
            <article className="author-card">
              <div className="author-icon">
                <div className="clipping-mask">
                  <span className="head-circle"></span>
                  <span className="body-circle"></span>
                </div>
              </div>
              <div className="author-details">
                <p className="author-name">
                  {window?.vz_user_quote?.author_name}
                </p>
                <p>
                  {window?.vz_user_quote?.createdAt}
                </p>
              </div>
            </article>
          </section>
      </div>
    </main>
  );
}

export default App;
