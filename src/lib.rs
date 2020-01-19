mod utils;
use web_sys::window;
use js_sys;
use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub fn create_dom(text: &str){
    let window = window().expect("Could not get window");
    let document = window.document().expect("Could not get document");
    let body = document.body().expect("Could not get body");

    let title = document
        .create_element("h1")
        .expect("Could not create element");
    let title_text = document.create_text_node(text); // always succeeds
    title
        .append_child(&title_text)
        .expect("Could not append child to title");

    // append to body
    body.append_child(&title)
        .expect("Could not append title to body");
}

#[wasm_bindgen]
pub fn test(set: &js_sys::Set) -> u32{
    let mut count = 0;

    // Call `keys` to get an iterator over the set's elements. Because this is
    // in a `for ... in ...` loop, Rust will automatically call its
    // `IntoIterator` trait implementation to convert it into a Rust iterator.
    for x in set.keys() {
        // We know the built-in iterator for set elements won't throw
        // exceptions, so just unwrap the element. If this was an untrusted
        // iterator, we might want to explicitly handle the case where it throws
        // an exception instead of returning a `{ value, done }` object.
        
        let x = x.unwrap();

        // If `x` is a string, increment our count of strings in the set!
        if x.is_string() {
            count += 1;
            
        }
    }

    return count;
}