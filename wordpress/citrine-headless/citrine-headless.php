<?php
/**
 * Plugin Name: Citrine One Headless Content
 * Description: Editorial back office and public read API for the Citrine One website.
 * Version: 1.0.0
 * Requires at least: 6.5
 * Requires PHP: 8.0
 * Author: Citrine One
 */

if (!defined('ABSPATH')) { exit; }

final class Citrine_Headless_Content {
	const POST_TYPE = 'citrine_content';
	const TAXONOMY = 'citrine_content_type';

	public static function init(): void {
		add_action('init', [self::class, 'register_content']);
		add_action('add_meta_boxes', [self::class, 'add_meta_boxes']);
		add_action('save_post_' . self::POST_TYPE, [self::class, 'save_meta']);
		add_action('rest_api_init', [self::class, 'register_api']);
		add_action('send_headers', [self::class, 'cors_headers']);
		add_action('admin_menu', [self::class, 'settings_menu']);
		add_action('admin_init', [self::class, 'register_settings']);
		register_activation_hook(__FILE__, [self::class, 'activate']);
	}

	public static function register_content(): void {
		register_post_type(self::POST_TYPE, [
			'labels' => ['name' => 'Citrine Content', 'singular_name' => 'Content item', 'add_new_item' => 'Add content item', 'edit_item' => 'Edit content item'],
			'public' => true, 'show_in_rest' => true, 'has_archive' => false,
			'menu_icon' => 'dashicons-format-aside', 'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'revisions'],
			'rewrite' => ['slug' => 'citrine-content'],
		]);
		register_taxonomy(self::TAXONOMY, self::POST_TYPE, [
			'labels' => ['name' => 'Content sections', 'singular_name' => 'Content section'],
			'public' => true, 'show_in_rest' => true, 'hierarchical' => false,
		]);
		foreach (['service', 'programme', 'person', 'insight', 'book', 'initiative', 'partner'] as $type) {
			if (!term_exists($type, self::TAXONOMY)) { wp_insert_term(ucwords($type), self::TAXONOMY, ['slug' => $type]); }
		}
	}

	public static function add_meta_boxes(): void {
		add_meta_box('citrine_details', 'Website display details', [self::class, 'render_meta_box'], self::POST_TYPE, 'normal', 'high');
	}

	public static function render_meta_box(WP_Post $post): void {
		wp_nonce_field('citrine_save_meta', 'citrine_meta_nonce');
		$fields = [
			'eyebrow' => 'Label / category', 'role' => 'Role / subtitle', 'link_url' => 'Link URL',
			'link_label' => 'Link label', 'sort_order' => 'Sort order', 'portfolio' => 'Portfolio lines (one per line: Heading | Detail)',
		];
		foreach ($fields as $key => $label) {
			$value = get_post_meta($post->ID, '_citrine_' . $key, true);
			$multi = $key === 'portfolio';
			echo '<p><label style="display:block;font-weight:600;margin-bottom:5px" for="citrine_' . esc_attr($key) . '">' . esc_html($label) . '</label>';
			if ($multi) { echo '<textarea style="width:100%;min-height:100px" id="citrine_' . esc_attr($key) . '" name="citrine_' . esc_attr($key) . '">' . esc_textarea($value) . '</textarea>'; }
			else { echo '<input style="width:100%" id="citrine_' . esc_attr($key) . '" name="citrine_' . esc_attr($key) . '" value="' . esc_attr($value) . '" ' . ($key === 'sort_order' ? 'type="number"' : 'type="text"') . '>'; }
			echo '</p>';
		}
		echo '<p>Choose the content section in the “Content sections” panel. Set status to Published when it is approved for the website. Featured image is available in the editor.</p>';
	}

	public static function save_meta(int $post_id): void {
		if (!isset($_POST['citrine_meta_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['citrine_meta_nonce'])), 'citrine_save_meta')) { return; }
		if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) { return; }
		if (!current_user_can('edit_post', $post_id)) { return; }
		foreach (['eyebrow', 'role', 'link_url', 'link_label', 'sort_order', 'portfolio'] as $key) {
			if (!isset($_POST['citrine_' . $key])) { continue; }
			$value = wp_unslash($_POST['citrine_' . $key]);
			$value = $key === 'portfolio' ? sanitize_textarea_field($value) : ($key === 'link_url' ? esc_url_raw($value) : sanitize_text_field($value));
			update_post_meta($post_id, '_citrine_' . $key, $value);
		}
	}

	public static function register_api(): void {
		register_rest_route('citrine/v1', '/content', [
			'methods' => WP_REST_Server::READABLE,
			'callback' => [self::class, 'get_content'],
			'permission_callback' => '__return_true',
		]);
	}

	public static function get_content(): WP_REST_Response {
		$posts = get_posts(['post_type' => self::POST_TYPE, 'post_status' => 'publish', 'numberposts' => 100, 'orderby' => 'meta_value_num', 'meta_key' => '_citrine_sort_order', 'order' => 'ASC']);
		$grouped = [];
		foreach ($posts as $post) {
			$terms = wp_get_object_terms($post->ID, self::TAXONOMY, ['fields' => 'slugs']);
			$type = !is_wp_error($terms) && $terms ? $terms[0] : 'uncategorized';
			$image_id = get_post_thumbnail_id($post);
			$item = [
				'id' => $post->ID, 'type' => $type, 'title' => get_the_title($post),
				'content' => apply_filters('the_content', $post->post_content),
				// Use the editable block content for cards so edits in the main editor are reflected immediately.
				'excerpt' => wp_trim_words(wp_strip_all_tags(strip_shortcodes($post->post_content)), 48, '…'),
				'eyebrow' => get_post_meta($post->ID, '_citrine_eyebrow', true),
				'role' => get_post_meta($post->ID, '_citrine_role', true),
				'url' => get_post_meta($post->ID, '_citrine_link_url', true),
				'linkLabel' => get_post_meta($post->ID, '_citrine_link_label', true),
				'portfolio' => array_values(array_filter(array_map('trim', explode("\n", (string) get_post_meta($post->ID, '_citrine_portfolio', true))))),
				'image' => $image_id ? wp_get_attachment_image_url($image_id, 'large') : '',
				'imageAlt' => $image_id ? get_post_meta($image_id, '_wp_attachment_image_alt', true) : '',
			];
			$grouped[$type][] = $item;
		}
		return new WP_REST_Response(['brand' => 'Citrine One', 'updated' => gmdate('c'), 'content' => $grouped], 200, ['Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0']);
	}

	public static function cors_headers(): void {
		$origin = get_http_origin();
		$allowed = array_filter(array_map('trim', explode("\n", (string) get_option('citrine_allowed_origins', "http://localhost:5173\nhttp://127.0.0.1:5173\nhttp://localhost:5500\nhttps://liviltechsolutions.github.io"))));
		if ($origin && in_array($origin, $allowed, true) && str_starts_with($_SERVER['REQUEST_URI'] ?? '', '/wp-json/citrine/v1/')) {
			header('Access-Control-Allow-Origin: ' . esc_url_raw($origin));
			header('Vary: Origin', false);
			header('Access-Control-Allow-Methods: GET, OPTIONS');
			header('Access-Control-Allow-Headers: Content-Type');
		}
	}

	public static function settings_menu(): void { add_options_page('Citrine Headless', 'Citrine Headless', 'manage_options', 'citrine-headless', [self::class, 'settings_page']); }
	public static function register_settings(): void { register_setting('citrine_headless', 'citrine_allowed_origins', ['sanitize_callback' => [self::class, 'sanitize_origins']]); }
	public static function sanitize_origins($value): string {
		$lines = array_filter(array_map('trim', preg_split('/\r\n|\r|\n/', (string) $value)));
		return implode("\n", array_map('esc_url_raw', $lines));
	}
	public static function settings_page(): void {
		if (!current_user_can('manage_options')) { return; }
		$value = get_option('citrine_allowed_origins', "http://localhost:5173\nhttp://127.0.0.1:5173\nhttp://localhost:5500\nhttps://liviltechsolutions.github.io");
		echo '<div class="wrap"><h1>Citrine One headless settings</h1><p>Allowed frontend origins, one per line. Only the public Citrine content API is enabled for cross-origin reads.</p><form method="post" action="options.php">';
		settings_fields('citrine_headless');
		echo '<textarea name="citrine_allowed_origins" rows="8" class="large-text code">' . esc_textarea($value) . '</textarea>';
		submit_button(); echo '</form><p>API endpoint: <code>' . esc_html(rest_url('citrine/v1/content')) . '</code></p></div>';
	}

	public static function activate(): void {
		self::register_content();
		flush_rewrite_rules();
		if (get_option('citrine_starter_content_created')) { return; }
		$starter = [
			['service', 'Strategic corporate communications', '01 / COUNSEL', 'Communications planning, positioning and practical counsel for corporate priorities.'],
			['service', 'Crisis communications', '02 / READINESS', 'Preparedness, issue response and reputation support for high-pressure moments.'],
			['service', 'Stakeholder management', '03 / RELATIONSHIPS', 'Thoughtful engagement with the people and communities who shape outcomes.'],
			['service', 'Brand perception research', '04 / EVIDENCE', 'Research and survey management to understand perceptions and inform decisions.'],
			['programme', 'Crisis communications strategy & simulation', '01 / C-SUITE PROGRAMME', 'A leadership programme. Add approved format and learning outcomes.'],
			['programme', 'Stakeholder management', '02 / C-SUITE PROGRAMME', 'A leadership programme. Add approved format and learning outcomes.'],
			['programme', 'Conflict management', '03 / C-SUITE PROGRAMME', 'A leadership programme. Add approved format and learning outcomes.'],
			['programme', 'Reputation management', '04 / C-SUITE PROGRAMME', 'A leadership programme. Add approved format and learning outcomes.'],
			['programme', 'Economic crime management', '05 / C-SUITE PROGRAMME', 'A leadership programme. Add approved format and learning outcomes.'],
			['person', 'Ivlynn Yap', 'Founder profile · review before publication', 'Biography and portfolio details require Citrine approval before publication.'],
			['person', 'Redza Arbee', 'Founder profile · review before publication', 'Biography and portfolio details require Citrine approval before publication.'],
			['book', 'Choices: A Memoir', 'MEMOIR', 'By Ivlynn Yap. Add approved book description and information route.'],
			['book', 'The Digital Transformation of Money', 'LEADERSHIP & DIGITAL MONEY', 'By Redza Arbee. Add approved purchase route.'],
			['initiative', 'Nimbus Presents: Money Wise Tales', '01 / FINANCIAL LITERACY', 'A financial literacy learning experience. Confirm programme and partner details.'],
			['initiative', 'Entrepreneurship Reality Check', '02 / ENTREPRENEURSHIP', 'Confirm the approved programme description and participation route.'],
			['insight', 'CF Insights with Ivlynn', 'VIDEO · AUDIO · NOTES', 'A series for data-led insights and perspectives on issues that matter.'],
		];
		foreach ($starter as $index => [$type, $title, $eyebrow, $body]) {
			$id = wp_insert_post(['post_type' => self::POST_TYPE, 'post_status' => 'draft', 'post_title' => $title, 'post_excerpt' => $body, 'post_content' => $body]);
			if (!is_wp_error($id) && $id) {
				wp_set_object_terms($id, $type, self::TAXONOMY);
				update_post_meta($id, '_citrine_eyebrow', $eyebrow);
				update_post_meta($id, '_citrine_sort_order', $index + 1);
			}
		}
		update_option('citrine_starter_content_created', 1);
	}
}

Citrine_Headless_Content::init();
