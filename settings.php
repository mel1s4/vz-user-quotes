<?php

function my_plugin_enqueue_media_uploader() {
  wp_enqueue_media(); // Enqueues the media uploader script
}
add_action( 'admin_enqueue_scripts', 'my_plugin_enqueue_media_uploader' );


function vz_user_quotes_settings_page() {
  add_options_page(
    'VZ User Quotes Settings', // Page title
    'VZ User Quotes', // Menu title
    'manage_options', // Capability required to access the page
    'vz-user-quotes-settings', // Page slug
    'vz_user_quotes_render_settings_page' // Callback function to render the page
  );
}
add_action('admin_menu', 'vz_user_quotes_settings_page');

// Render the settings page
function vz_user_quotes_render_settings_page() {
  ?>
  <div class="wrap">
    <h1>VZ User Quotes Settings</h1>
    <p>Customize the settings for the VZ User Quotes plugin.</p>
    <!-- Add your settings fields here -->

    <form method="post" action="options.php">
      <?php
        settings_fields('vz-user-quotes-settings');
        do_settings_sections('vz-user-quotes-settings');
        submit_button();
      ?>
    </form>
  </div>
  <?php
}

// Register the settings
function vz_user_quotes_register_settings() {
  register_setting(
    'vz-user-quotes-settings', // Option group
    'vz-user-quotes-settings', // Option name
    'vz_user_quotes_validate_settings' // Sanitization callback
  );

  add_settings_section(
    'vz-user-quotes-general', // Section ID
    'General Settings', // Section title
    'vz_user_quotes_render_general_section', // Callback function to render the section
    'vz-user-quotes-settings' // Page slug
  );

  $fields = [
    'company_name' => [
      'title' => 'Company Name',
      'type' => 'text',
    ],
    'company_address_line_1' => [
      'title' => 'Company Address Line 1',
      'type' => 'text',
    ],
    'company_address_number' => [
      'title' => 'Company Address Number',
      'type' => 'number',
    ],
    'company_address_line_2' => [
      'title' => 'Company Address Line 2',
      'type' => 'text',
    ],
    'company_phone' => [
      'title' => 'Company Phone',
      'type' => 'tel',
    ],
    'company_email' => [
      'title' => 'Company Email',
      'type' => 'email',
    ],
    'company_website' => [
      'title' => 'Company Website',
      'type' => 'url',
    ],
    'company_logo' => [
      'title' => 'Company Logo',
      'type' => 'file',
    ],
    'company_vat_number' => [
      'title' => 'Company VAT Number',
      'type' => 'text',
    ],
    'company_registration_number' => [
      'title' => 'Company Registration Number',
      'type' => 'text',
    ],
    'recreate_new_post' => [
      'title' => 'Recreate New Post',
      'type' => 'button',
    ],
    'terms_and_conditions_text' => [
      'title' => 'Terms and Conditions Text',
      'type' => 'text',
    ],
    'my_quotes_page' => [
      'title' => 'My Quotes Page',
      'type' => 'text',
    ],
  ];

  foreach ($fields as $field => $options) {
    add_settings_field(
      'vz-user-quotes-' . $field, // Field ID
      $options['title'], // Field title
      'vz_user_quotes_render_'.$options['type'].'_field', // Callback function to render the field
      'vz-user-quotes-settings', // Page slug
      'vz-user-quotes-general', // Section ID
      array(
        'field' => $field,
        'label' => $options['title'],
      )
    );
  }
}

add_action('admin_init', 'vz_user_quotes_register_settings');

// Validate the settings
function vz_user_quotes_validate_settings($input) {
  $output = array();

  // Sanitize the input
  foreach ($input as $key => $value) {
    // allow for link tags
    $output[$key] = wp_kses_post($value);
  }

  return $output;
}

// Render the general settings section
function vz_user_quotes_render_general_section() {
  echo '<p>Enter the general settings for the VZ User Quotes plugin.</p>';
}

function vz_user_quotes_render_field($args, $type)  {
  $options = get_option('vz-user-quotes-settings');
  $field = $args['field'];
  $label = $args['label'];

  echo '<input type="'.$type.'" name="vz-user-quotes-settings[' . $field . ']" value="' . esc_attr($options[$field]) . '" />';
}

function vz_user_quotes_render_button_field($args) {
  $options = get_option('vz-user-quotes-settings');
  $field = $args['field'];
  $label = $args['label'];
  ?>
  <button type="submit" name="action" value="vz_user_quote_create">
    <?php echo __vz( 'Recreate New Wuote  Post' ); ?>
  </button>
  <?php
}

function vz_user_quotes_render_text_field($args) {
  vz_user_quotes_render_field($args, 'text');
}

function vz_user_quotes_render_number_field($args) {
  vz_user_quotes_render_field($args, 'number');
}

function vz_user_quotes_render_tel_field($args) {
  vz_user_quotes_render_field($args, 'tel');
}

function vz_user_quotes_render_email_field($args) {
  vz_user_quotes_render_field($args, 'email');
}

function vz_user_quotes_render_url_field($args) {
  vz_user_quotes_render_field($args, 'url');
}

function vz_user_quotes_render_file_field($args) {
  // select file from media library
  $options = get_option('vz-user-quotes-settings');
  $field = $args['field'];
  $label = $args['label'];
  ?>
  <input type="text" 
         id="my_image_url" 
         name="vz-user-quotes-settings[<?php echo $field ?>]" 
         value="<?php echo esc_attr( $options[$field] ); ?>" />
  <input type="button" 
         id="my_image_upload_button" 
         class="button" 
         value="<?php __vz( 'Upload Image' ); ?>" />
  <img id="my_image_preview" 
        style="max-width: 200px; display: block;"
        src="<?php echo esc_attr( $options[$field] ); ?>" />


  <?php
}

function my_plugin_enqueue_admin_scripts() {
  wp_enqueue_script( 'my_plugin_media_uploader', plugin_dir_url( __FILE__ ) . 'media-uploader.js', array( 'jquery' ), null, true );
}
add_action( 'admin_enqueue_scripts', 'my_plugin_enqueue_admin_scripts' );


