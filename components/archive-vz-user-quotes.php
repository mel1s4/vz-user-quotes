<?php
  $create_new_url = get_site_url() . '/vz-user-quotes/new';
  $action = $_GET['action'] ?? '';
  $quote_slug = $_GET['quote_slug'] ?? '';
  $current_url = strtok($_SERVER["REQUEST_URI"],'?');
  $page = $_GET['pag'] ?? 1;
  if (!is_numeric($page)) {
    $page = 1;
  }
  if ($action === 'delete' && $quote_slug) {
    vz_user_quote_delete($quote_slug);
    wp_redirect($current_url);
  }
  if ($action === 'duplicate' && $quote_slug) {
    vz_user_quote_duplicate($quote_slug);
    wp_redirect($current_url);
  }
?>

<section class="user-quotes">
  <?php
    $args = array(
      'post_type' => 'vz-user-quotes',
      'posts_per_page' => -1,
      'meta_key' => 'user_id',
      'meta_value' => get_current_user_id(),
      'orderby' => 'date',
      'order' => 'DESC',
      'paged' => $page,
      'post_status' => 'publish',
      'posts_per_page' => 10,
      's' => $_GET['search'] ?? '',
    );
    $quotes = new WP_Query($args);
  ?>
  <form class="vz-quotes__pagination">
    <a class="vz-quotes__create-button" href="<?php echo $create_new_url ?>">
      <?php __vz('Create a new quote') ?>
    </a>
    <div class="vz-quotes__search-container">
      <input type="text" 
             name="search"
             placeholder="<?php __vz('Search') ?>"
             value="<?php echo $_GET['search'] ?? '' ?>">
      <button type="submit">
        <?php __vz('Search') ?>
      </button>
    </div>
    <button class="vz-quotes__pagination-button"
            name="pag"
            value="<?php echo max(1, $page - 1) ?>">
      <?php __vz('Previous') ?>
    </button>
    <button class="vz-quotes__pagination-button"
            name="pag"
            value="<?php echo min($page + 1, $quotes->max_num_pages) ?>">
      <?php __vz('Next') ?>
    </button>
  </form>
  <ul class="vz-quotes__quotes-list">

      
    <?php
      if ($quotes->have_posts()) {
        while ($quotes->have_posts()) {
          $quotes->the_post();
          $quote_id = get_the_ID();
          $quote_slug = get_post_field('post_name', $quote_id);
          ?>
            <li>
              <article class="vz-quote__card">
                <div class="vz-quote__card-details">
                  <p class="vz-quote__slug">
                    <a href="<?php echo get_permalink($quote_id) ?>">
                      <?php  echo $quote_slug;  ?>
                    </a>
                  </p>
                  <p class="vz-quote__date">
                    <?php echo get_the_date() ?>
                  </p>
                  <p class="vz-quote__note">
                    <?php echo get_post_meta($quote_id, 'vz-quote-notes', true) ?>
                  </p>
                </div>
                <form class="vz-quote__card-actions">
                  <input type="hidden" 
                         name="quote_slug" 
                         value="<?php echo $quote_slug ?>">
                  <button class="vz-quote__delete-button"
                          name="action"
                          value="delete">
                    <?php __vz('Delete') ?>
                  </button>
                  <button class="vz-quote__duplicate-button"
                          name="action"
                          value="duplicate">
                    <?php __vz("Duplicate"); ?>
                  </button>
                  <a href="<?php echo get_permalink($quote_id) ?>" 
                    class="vz-quote__edit-button">
                    <?php __vz("Edit") ?>
                  </a>
                </form>
              </article>
            </li>
          <?php
        }
      }
    ?>
  </ul>
</section>