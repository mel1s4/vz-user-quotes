<?php 

/**
 * Plugin Name: Viroz User Quotes
 * Plugin URI: https://viroz.studio/portfolio/user-quotes/
 * Description: Creates a new post type for a community directory. Registered users may submit a new community listing and rate existing listings.
 * Version: 0.0.1
 * Author: Melisa Viroz
 * Author URI: https://melisaviroz.com
 * License: GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain: vz-user-quotes
 * Domain Path: /languages
 */

require plugin_dir_path( __FILE__ ) . 'settings.php';

function __vz( $text ) {
  echo __( $text, 'vz-community-directory' );
}

function get_vz($string) {
  return __( $string, 'vz-community-directory' );
}

function vz_user_quotes_register_post_type() {
  $labels = array(
    'name'                  => _x( 'User Quotes', 'Quotes', 'vz-user-quotes' ),
    'singular_name'         => _x( 'User Quote', 'Quote', 'vz-user-quotes' ),
    'menu_name'             => __( 'User Quotes', 'vz-user-quotes' ),
    'name_admin_bar'        => __( 'User Quote', 'vz-user-quotes' ),
    'archives'              => __( 'User Quote Archives', 'vz-user-quotes' ),
    'attributes'            => __( 'User Quote Attributes', 'vz-user-quotes' ),
    'parent_item_colon'     => __( 'Parent User Quote:', 'vz-user-quotes' ),
    'all_items'             => __( 'All User Quotes', 'vz-user-quotes' ),
    'add_new_item'          => __( 'Add New User Quote', 'vz-user-quotes' ),
    'add_new'               => __( 'Add New', 'vz-user-quotes' ),
    'new_item'              => __( 'New User Quote', 'vz-user-quotes' ),
    'edit_item'             => __( 'Edit User Quote', 'vz-user-quotes' ),
    'update_item'           => __( 'Update User Quote', 'vz-user-quotes' ),
    'view_item'             => __( 'View User Quote', 'vz-user-quotes' ),
    'view_items'            => __( 'View User Quotes', 'vz-user-quotes' ),
    'search_items'          => __( 'Search User Quote', 'vz-user-quotes' ),
    'not_found'             => __( 'Not found', 'vz-user-quotes' ),
    'not_found_in_trash'    => __( 'Not found in Trash', 'vz-user-quotes' ),
    'featured_image'        => __( 'Featured Image', 'vz-user-quotes' ),
    'set_featured_image'    => __( 'Set featured image', 'vz-user-quotes' ),
    'remove_featured_image' => __( 'Remove featured image', 'vz-user-quotes' ),
    'use_featured_image'    => __( 'Use as featured image', 'vz-user-quotes' ),
    'insert_into_item'      => __( 'Insert into User Quote', 'vz-user-quotes' ),
    'uploaded_to_this_item' => __( 'Uploaded to this User Quote', 'vz-user-quotes' ),
    'items_list'            => __( 'User Quotes list', 'vz-user-quotes' ),
    'items_list_navigation' => __( 'User Quotes list navigation', 'vz-user-quotes' ),
    'filter_items_list'     => __( 'Filter User Quotes list', 'vz-user-quotes' ),
  );
  $args = array(
    'label'                 => __( 'User Quote', 'vz-user-quotes' ),
    'description'           => __( 'User Quotes', 'vz-user-quotes' ),
    'labels'                => $labels,
    'supports'              => array( 'revisions', 'author', 'excerpt' ),
    'hierarchical'          => false,
    'public'                => true,
    'show_ui'               => true,
    'show_in_menu'          => true,
    'menu_position'         => 5,
    'menu_icon'             => 'dashicons-format-quote',
    'show_in_admin_bar'     => true,
    'show_in_nav_menus'     => false,
    'can_export'            => true,
    'has_archive'           => false,
    'exclude_from_search'   => false,
    'publicly_queryable'    => true,
    'capability_type'       => 'post',
  );
  register_post_type( 'vz-user-quotes', $args );
}
add_action( 'init', 'vz_user_quotes_register_post_type' );

function vz_user_quotes_init($post_id, $post, $update) {
  if ($post->post_type === 'vz-user-quotes' && !$update) {
    $random = rand(1000, 9999);
    $slug = hash('adler32', date('YmdHis') . $random);
    wp_update_post(array('ID' => $post_id, 'post_name' => $slug));
  }
  $user_id = get_post_meta($post_id, 'user_id', true);
  if (!$user_id) {
    update_post_meta($post_id, 'user_id', get_current_user_id());
  }
}
add_action('wp_insert_post', 'vz_user_quotes_init', 10, 3);


function vz_user_quote_shortcode() {
  ob_start(); 
  require plugin_dir_path( __FILE__ ) . 'components/archive-vz-user-quotes.php';
  return ob_get_clean();
}
add_shortcode( 'vz-user-quotes', 'vz_user_quote_shortcode' );

function vz_user_quote_template_override($template) {
  if (is_singular('vz-user-quotes')) {
    $plugin_template = plugin_dir_path(__FILE__) . 'components/single-vz-user-quotes.php';
    if (file_exists($plugin_template)) {
      return $plugin_template;
    }
  }
  return $template;
}
add_filter('template_include', 'vz_user_quote_template_override');

function vz_quote_lost_password_url() {
  if (in_array('woocommerce/woocommerce.php', apply_filters('active_plugins', get_option('active_plugins')))) {
    return wc_lostpassword_url();
  } else {
    return wp_lostpassword_url();
  }
}

function vz_get_react_component_resources() {
  $css = 'main.css';
  $js = 'main.js';

  // $folder = plugin_dir_url(__FILE__) . 'vz-user-quote-single/build/static';

  // // read the directory
  // $css_files = scandir($folder . '/css');
  // foreach ($css_files as $file) {
  //   if (preg_match('/main\.[a-zA-Z0-9]*\.css/', $file)) {
  //     $css = $file;
  //   }
  // }

  // $js_files = scandir($folder . '/js');
  // foreach ($js_files as $file) {
  //   if (preg_match('/main\.[a-zA-Z0-9]*\.js/', $file)) {
  //     $js = $file;
  //   }
  // }

  return [
    'css' => $css,
    'js' => $js,
  ];
}

function vz_user_quote_enqueue_scripts() {
  wp_enqueue_style('vz-user-quotes-archive-style', plugin_dir_url(__FILE__) . 'style.css', array(), '1.0.0', 'all');
  if (is_singular('vz-user-quotes')) {
    // get any file with the format main.[a-Z0-9]*.css
    $files = vz_get_react_component_resources();
    wp_enqueue_style('vz-user-quote-style', plugin_dir_url(__FILE__) . 'vz-user-quote-single/build/static/css/' . $files['css'], array(), '1.0.0', 'all');
    wp_enqueue_script('vz-user-quote', plugin_dir_url(__FILE__) . 'vz-user-quote-single/build/static/js/' . $files['js'], array('wp-element'), '0.0.1', true);
    $params = [
      'nonce' => wp_create_nonce('wp_rest'),
      'rest_url' => esc_url_raw(rest_url()),
      'lost_password_url' => vz_quote_lost_password_url(),
      'quote_slug' => get_post_field('post_name'),
      'author_name' => get_the_author_meta('display_name'),
      'last_edit' => get_the_modified_date(),
      'created_at' => get_the_date(),
      'company_details' => get_option('vz-user-quotes-settings'),
      'company_logo' => get_option('vz-user-quotes-settings')['company_logo'],
      'client_details' => get_post_meta(get_the_ID(), 'vz-quote-client', true),
      'products' => get_post_meta(get_the_ID(), 'vz-quote-products', true),
      'options' => array(
        'subtotal' => get_post_meta(get_the_ID(), 'vz-quote-subtotal', true),
        'vat' => get_post_meta(get_the_ID(), 'vz-quote-vat', true),
        'total' => get_post_meta(get_the_ID(), 'vz-quote-total', true),
        'notes' => get_post_meta(get_the_ID(), 'vz-quote-notes', true),
        'privacy' => get_post_meta(get_the_ID(), 'vz-quote-privacy', true),
        'password' => get_post_meta(get_the_ID(), 'vz-quote-privacy__password', true),
      ),
    ];
    // check if woocommerce is installed
    if (in_array('woocommerce/woocommerce.php', apply_filters('active_plugins', get_option('active_plugins')))) {
      $params['woocommerce'] = true;
      $params['woocommerce_cart_contents'] = vz_get_cart_contents();
    }
    wp_localize_script('vz-user-quote', 'vz_user_quote', $params);
  }
}

add_action('wp_enqueue_scripts', 'vz_user_quote_enqueue_scripts');

function vz_get_cart_contents() {
  $cart = WC()->cart->get_cart();
  $cart_contents = [];
  foreach ($cart as $item) {
    $product = wc_get_product($item['product_id']);
    $cart_contents[] = [
      'id' => $item['product_id'],
      'sku' => $product->get_sku(),
      'name' => $product->get_name(),
      'price' => $product->get_price(),
      'quantity' => $item['quantity'],
    ];
  }
  return $cart_contents;
}

function vz_user_quote_add_custom_field() {
  add_meta_box(
    'vz-user-quote-user-id',
    __('User ID', 'vz-user-quotes'),
    'vz_user_quote_user_id_callback',
    'vz-user-quotes',
    'side',
    'default'
  );
}

function vz_user_quote_user_id_callback($post) {
  wp_nonce_field('vz_user_quote_save_user_id', 'vz_user_quote_user_id_nonce');
  $user_id = get_post_meta($post->ID, 'user_id', true);
  $users = get_users();
  ?>
    <select name="user_id">
      <option value=""><?php _e('Select a user', 'vz-user-quotes') ?></option>
      <?php foreach ($users as $user) : ?>
        <option value="<?php echo $user->ID ?>" <?php selected($user_id, $user->ID) ?>>
          <?php echo $user->display_name ?>
        </option>
      <?php endforeach; ?>
    </select>
  <?php

}

function vz_user_quote_save_user_id($post_id) {
  if (!isset($_POST['vz_user_quote_user_id_nonce'])) {
    return;
  }
  if (!wp_verify_nonce($_POST['vz_user_quote_user_id_nonce'], 'vz_user_quote_save_user_id')) {
    return;
  }
  if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
    return;
  }
  if (!current_user_can('edit_post', $post_id)) {
    return;
  }
  if (!isset($_POST['user_id'])) {
    return;
  }
  update_post_meta($post_id, 'user_id', sanitize_text_field($_POST['user_id']));
}

add_action('add_meta_boxes', 'vz_user_quote_add_custom_field');
add_action('save_post', 'vz_user_quote_save_user_id');

// create a quote with slug 'new' if it doesnt exist
function vz_user_quote_create() {
  $args = array(
    'post_type' => 'vz-user-quotes',
    'name' => 'new',
    'post_status' => 'publish',
  );
  $quote = get_posts($args);
  if (empty($quote)) {
    $quote_id = wp_insert_post(array(
      'post_type' => 'vz-user-quotes',
      'post_name' => 'new',
      'post_status' => 'publish',
    ));
  }
  exit;
}

if (isset($_GET['action']) && $_GET['action'] === 'vz_user_quote_create') {
  vz_user_quote_create();
}


function vz_user_quote_delete($quote_slug) {
  $args = array(
    'name' => $quote_slug,
    'post_type' => 'vz-user-quotes',
    'post_status' => 'publish',
  );
  $quote = get_posts($args);
  if (!empty($quote)) {
    $quote_id = $quote[0]->ID;
    wp_delete_post($quote_id);
  }
}

function vz_user_quote_duplicate($quote_slug) {
  $args = array(
    'name' => $quote_slug,
    'post_type' => 'vz-user-quotes',
    'post_status' => 'publish',
  );
  $quote = get_posts($args);
  if (!empty($quote)) {
    $quote_id = $quote[0]->ID;
    $quote_slug = hash('adler32', date('YmdHis'));
    $new_quote_id = wp_insert_post(array(
      'post_type' => 'vz-user-quotes',
      'post_name' => $quote_slug,
      'post_status' => 'publish',
    ));
    $quote_meta = get_post_meta($quote_id);
    foreach ($quote_meta as $key => $value) {
      update_post_meta($new_quote_id, $key, $value[0]);
    }
  }
}

function vz_user_quote_save( WP_REST_Request $request ) {
  $data = json_decode(file_get_contents('php://input'), true);
  $user = wp_get_current_user();

  if (!is_user_logged_in()) {
    $response = [
      'status' => 'error',
      'message' => 'You must be logged in to save a quote',
      'user' => $user,
    ];
    echo json_encode($response);
    return;
  }

  $quote_slug = $data['quote_slug'];
  $products = $data['products'];
  $client = $data['client'];
  $options = $data['options'];
  
  if ($quote_slug == 'new') {
    $random = rand(1000, 9999);
    $quote_slug = hash('adler32', date('YmdHis') . $random);
    $quote_id = wp_insert_post(array(
      'post_type' => 'vz-user-quotes',
      'post_name' => $quote_slug,
      'post_status' => 'publish',
    ));
    update_post_meta($post_id, 'user_id', get_current_user_id());
  } else {
    $args = array(
      'name' => $quote_slug,
      'post_type' => 'vz-user-quotes',
      'post_status' => 'publish',
    );
    $quote = get_posts($args);
  
    if (!empty($quote)) {
      if(!current_user_can('edit_post', $quote[0]->ID)) {
        $quote_user_id = get_post_meta($quote[0]->ID, 'user_id', true);
        if ($quote_user_id !== get_current_user_id()) {
          $response = [
            'status' => 'error',
            'message' => 'You do not have permission to edit this quote'
          ];
          echo json_encode($response);
          exit;
        }
      }
    }
    $quote_id = $quote[0]->ID;
  }

  $post_title = '';
  $post_description = '';
  if ($client['name'] != '') {
    $post_title = $client['name'];
  }
  if ($client['company'] != '') {
    if ($post_title != '') {
      $post_title .= ' - ' . $client['company'];
    } else {
      $post_title = $client['company'];
    }
  }

  if ($post_title !== '') {
    wp_update_post(array(
      'ID' => $quote_id,
      'post_title' => $post_title,
    ));
  }

  if($options['notes'] != '') {
    wp_update_post(array(
      'ID' => $quote_id,
      'post_excerpt' => $options['notes'],
    ));
  }

  update_post_meta($quote_id, 'vz-quote-products', $products);
  update_post_meta($quote_id, 'vz-quote-client', $client);
  
  update_post_meta($quote_id, 'vz-quote-subtotal', $options['subtotal']);
  update_post_meta($quote_id, 'vz-quote-vat', $options['vat']);
  update_post_meta($quote_id, 'vz-quote-total', $options['total']);
  update_post_meta($quote_id, 'vz-quote-notes', $options['notes']);
  update_post_meta($quote_id, 'vz-quote-privacy', $options['privacy']);

  if ($options['password'] != '') {
    update_post_meta($quote_id, 'vz-quote-privacy__password', md5($options['password']));
  }

  $status = 'success';
  $response = [
    'status' => $status,
    'quote_slug' => $quote_slug
  ];
  echo json_encode($response);
  
  exit;
}

function vz_user_quote_rest_api() {
  register_rest_route('vz-user-quotes/v1', '/save-quote', array(
    'methods' => 'POST',
    'callback' => 'vz_user_quote_save',
  ));
}

add_action('rest_api_init', 'vz_user_quote_rest_api');


// add a section to woocommerce my account called 'My Quotes'
function vz_user_quote_my_account_menu_items($items) {
  $items['vz-user-quotes'] = 'My Quotes';
  return $items;
}

add_filter('woocommerce_account_menu_items', 'vz_user_quote_my_account_menu_items');

function vz_user_quote_my_account_endpoints() {
  add_rewrite_endpoint('vz-user-quotes', EP_PAGES);
}

add_action('init', 'vz_user_quote_my_account_endpoints');

function vz_user_quote_my_account_endpoint() {
  require plugin_dir_path( __FILE__ ) . 'components/archive-vz-user-quotes.php';
}

add_action('woocommerce_account_vz-user-quotes_endpoint', 'vz_user_quote_my_account_endpoint');

function vz_user_quote_my_account_query_vars($vars) {
  $vars[] = 'vz-user-quotes';
  return $vars;
}

add_filter('query_vars', 'vz_user_quote_my_account_query_vars');

function vz_user_quote_my_account_redirect() {
  $endpoint = 'vz-user-quotes';
  if (isset($_GET[$endpoint])) {
    wp_redirect(wc_get_account_endpoint_url($endpoint));
    exit;
  }
}

add_action('template_redirect', 'vz_user_quote_my_account_redirect');

function vz_user_quote_my_account_title($title) {
  global $wp_query;
  $endpoint = 'vz-user-quotes';
  if (isset($wp_query->query_vars[$endpoint])) {
    return get_vz('My Quotes');
  }
  return $title;
}