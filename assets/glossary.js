// ====================================================================
// Apertura — Photography Glossary
// 60+ terms across technical, aesthetic, historical, and genre categories
// ====================================================================

const GLOSSARY = [
  // A
  { term: 'Aperture', cat: 'Technical', def: 'The opening in a lens through which light passes to reach the sensor. Measured in f-stops (e.g., f/1.8, f/8, f/16). Smaller f-numbers mean wider apertures, which let in more light and create shallower depth of field.' },
  { term: 'Aperture Priority (A/Av)', cat: 'Technical', def: 'A semi-automatic camera mode where you set the aperture and the camera automatically selects the shutter speed for a correct exposure. Ideal for controlling depth of field.' },
  { term: 'ASA', cat: 'Technical', def: 'The old film-speed standard, now replaced by ISO. A 400 ASA film is equivalent to ISO 400 digital sensitivity.' },
  { term: 'Auto Focus (AF)', cat: 'Technical', def: 'A camera system that automatically adjusts the lens to achieve sharp focus on a subject. Modern systems use phase-detection, contrast-detection, or hybrid methods.' },

  // B
  { term: 'Bokeh', cat: 'Aesthetic', def: 'The aesthetic quality of the out-of-focus areas in a photograph, especially the pleasing circles of light created when point light sources are rendered out of focus. Derived from the Japanese word for "blur."' },
  { term: 'Bracketing', cat: 'Technical', def: 'Taking multiple shots of the same scene at different exposure settings (usually +/- 1 or 2 stops). Used to ensure one exposure is correct or to combine images for HDR.' },
  { term: 'Burst Mode', cat: 'Technical', def: 'A camera mode that captures multiple frames per second while the shutter button is held. Essential for action, wildlife, and any unpredictable moment.' },
  { term: 'Bracketing', cat: 'Technical', def: 'A technique where the camera takes a series of images at different exposure values to ensure one is correctly exposed, or to combine them for HDR.' },

  // C
  { term: 'Composition', cat: 'Aesthetic', def: 'The arrangement of visual elements within the frame. Includes rules like the rule of thirds, leading lines, framing, symmetry, and negative space — as well as when to break them.' },
  { term: 'Crop Factor', cat: 'Technical', def: 'The ratio of a camera sensor\'s size to a 35mm full-frame sensor. A 1.5x crop factor means a 50mm lens on that camera has the field of view of a 75mm lens on a full-frame body.' },
  { term: 'Catchlight', cat: 'Aesthetic', def: 'A small bright reflection in a subject\'s eye in a portrait. It brings life and dimension to the face. Without a catchlight, eyes look dull or dead.' },

  // D
  { term: 'Depth of Field (DOF)', cat: 'Technical', def: 'The zone of acceptable sharpness in front of and behind the subject\'s plane of focus. Controlled by aperture, focal length, and subject distance. Shallow DOF blurs the background; deep DOF keeps everything sharp.' },
  { term: 'Dynamic Range', cat: 'Technical', def: 'The range of brightness a sensor can capture from shadows to highlights in a single exposure, usually measured in stops. Modern full-frame sensors capture 14+ stops; human eyes about 20.' },
  { term: 'Decisive Moment', cat: 'Historical', def: 'A term coined by Henri Cartier-Bresson to describe the fraction of a second when the visual elements of a scene come together to communicate the essence of an event. The photographer\'s job is to recognize and capture it.' },
  { term: 'Depth of Field Preview', cat: 'Technical', def: 'A camera button that stops down the lens to the selected aperture, allowing you to see in the viewfinder what will actually be in focus when the shot is taken.' },

  // E
  { term: 'Exposure', cat: 'Technical', def: 'The total amount of light reaching the sensor. Determined by the combination of aperture, shutter speed, and ISO. A correct exposure renders the scene as the eye sees it (or as the photographer intends).' },
  { term: 'Exposure Triangle', cat: 'Technical', def: 'The relationship between aperture, shutter speed, and ISO. Each affects exposure and has aesthetic side effects. Changing one requires adjusting another to maintain the same exposure.' },
  { term: 'Exposure Compensation', cat: 'Technical', def: 'A camera control that lets you make the image brighter or darker than the camera\'s meter suggests. Essential for shooting in tricky light like snow, backlighting, or high-contrast scenes.' },
  { term: 'EXIF', cat: 'Technical', def: 'Exchangeable Image File Format — metadata embedded in every digital photo that records the camera settings, date, GPS, and other technical info. The forensic record of how a picture was made.' },

  // F
  { term: 'F-Stop', cat: 'Technical', def: 'A unit of measurement for aperture, calculated as the focal length divided by the diameter of the lens opening. Each full f-stop (1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22) halves or doubles the light.' },
  { term: 'Focal Length', cat: 'Technical', def: 'The distance (in millimeters) from the optical center of a lens to the sensor when focused at infinity. Determines the angle of view: shorter focal lengths are wider, longer are more telephoto.' },
  { term: 'Fill Light', cat: 'Lighting', def: 'A secondary light used to soften or eliminate shadows created by the main (key) light. Often a reflector in natural light, or a fill flash in mixed lighting.' },
  { term: 'Frame Rate', cat: 'Technical', def: 'The number of consecutive frames a camera can capture per second. Important for action and wildlife — modern mirrorless cameras shoot 20-30 fps with continuous autofocus.' },

  // G
  { term: 'Golden Hour', cat: 'Aesthetic', def: 'The period shortly after sunrise or before sunset when the sun is low, light is warm and soft, and shadows are long. The most flattering natural light for portraits and landscapes.' },
  { term: 'Golden Ratio', cat: 'Aesthetic', def: 'A mathematical proportion (1:1.618) found throughout nature and used in art and design for millennia. In photography, it appears in composition as a more sophisticated alternative to the rule of thirds.' },
  { term: 'Grayscale', cat: 'Technical', def: 'An image composed of shades of gray from black to white, without color. The first step in processing a RAW color file. Many photographers work in grayscale as a tonal planning step.' },

  // H
  { term: 'Histogram', cat: 'Technical', def: 'A graph showing the distribution of tones in an image, from shadows on the left to highlights on the right. The most reliable way to evaluate exposure — independent of the LCD\'s brightness or your eyes\' adaptation.' },
  { term: 'Hyperfocal Distance', cat: 'Technical', def: 'The closest distance at which a lens can be focused while keeping objects at infinity acceptably sharp. Focusing at this distance maximizes depth of field. Essential knowledge for landscape photography.' },
  { term: 'HDR (High Dynamic Range)', cat: 'Technical', def: 'A technique that combines multiple exposures of the same scene (usually +/- 2 or 3 stops apart) into a single image with extended dynamic range, retaining detail in both shadows and highlights.' },

  // I
  { term: 'ISO', cat: 'Technical', def: 'A measure of the sensor\'s sensitivity to light. Lower ISO (100-400) produces cleaner images; higher ISO (1600+) enables low-light shooting but adds noise. Every doubling of ISO doubles the sensor\'s sensitivity.' },
  { term: 'Inverse Square Law', cat: 'Lighting', def: 'The principle that light intensity falls off with the square of the distance from the source. Doubling the distance from a light source gives you one quarter of the light. Critical for understanding flash and studio lighting.' },

  // J
  { term: 'JPEG', cat: 'Technical', def: 'A compressed image file format that discards some image data to create smaller files. Convenient for sharing, less flexible for editing. Always shoot RAW if you can.' },

  // L
  { term: 'Leading Lines', cat: 'Aesthetic', def: 'Compositional lines within a frame (roads, fences, rivers, architecture) that guide the viewer\'s eye toward the subject. One of the most reliable ways to create dynamic compositions.' },
  { term: 'Long Exposure', cat: 'Technical', def: 'A photograph taken with a shutter speed of 1 second or longer, usually on a tripod. Used to blur motion (waterfalls, stars) or to gather more light in low-light scenes.' },

  // M
  { term: 'Manual Mode (M)', cat: 'Technical', def: 'A camera mode where the photographer sets all three exposure parameters — aperture, shutter speed, and ISO. The mode that gives you complete control over every creative decision.' },
  { term: 'Megapixel (MP)', cat: 'Technical', def: 'One million pixels. A 24MP camera produces images roughly 6000 pixels wide by 4000 pixels tall. More megapixels mean more cropping flexibility and larger print capability — but do not, on their own, mean better image quality.' },
  { term: 'Mirrorless', cat: 'Technical', def: 'A camera design that omits the mirror and optical viewfinder of a DSLR, instead feeding the sensor output directly to an electronic viewfinder or rear screen. Smaller, lighter, and quieter than DSLRs.' },

  // N
  { term: 'Negative Space', cat: 'Aesthetic', def: 'The empty area around and between subjects in a photograph. Active, not passive — it gives the subject room to breathe and amplifies the composition.' },
  { term: 'Noise', cat: 'Technical', def: 'Unwanted random variation in brightness or color in an image, most visible in shadow areas and at high ISO settings. Digital noise is the sensor\'s equivalent of film grain.' },

  // P
  { term: 'Pixel', cat: 'Technical', def: 'Short for "picture element." The smallest unit of a digital image. A 24MP image is composed of 24 million pixels, each holding a single color value.' },
  { term: 'Panning', cat: 'Technical', def: 'A technique where the photographer moves the camera to follow a moving subject during a slow exposure, creating a sharp subject with a motion-blurred background.' },
  { term: 'Perspective', cat: 'Aesthetic', def: 'The spatial relationship between objects in a frame. Controlled by the photographer\'s position relative to the subject — moving even a few feet can radically change an image.' },
  { term: 'Pixel Binning', cat: 'Technical', def: 'A computational technique in smartphone cameras that combines data from multiple small pixels into a single larger virtual pixel, improving low-light performance at the cost of resolution.' },

  // R
  { term: 'RAW', cat: 'Technical', def: 'An uncompressed image file that contains all the data captured by the sensor, with no in-camera processing. Requires post-processing but offers maximum flexibility for exposure, color, and detail recovery.' },
  { term: 'Rule of Thirds', cat: 'Aesthetic', def: 'A compositional guideline that divides the frame into a 3x3 grid. Placing key elements on the intersections or along the lines creates more dynamic compositions than centering everything.' },

  // S
  { term: 'Shutter Speed', cat: 'Technical', def: 'The length of time the sensor is exposed to light, measured in seconds (1/1000s, 1/60s, 1s, etc.). Fast shutter speeds freeze motion; slow speeds blur it. Doubling or halving the shutter speed changes exposure by one stop.' },
  { term: 'Shutter Priority (S/Tv)', cat: 'Technical', def: 'A semi-automatic camera mode where you set the shutter speed and the camera selects the aperture for a correct exposure. Ideal for controlling motion blur.' },
  { term: 'Sensor Size', cat: 'Technical', def: 'The physical dimensions of a camera\'s image sensor. Larger sensors (full-frame, medium format) gather more light, produce better dynamic range, and allow shallower depth of field than smaller sensors (APS-C, micro four-thirds, smartphone).' },
  { term: 'Stops', cat: 'Technical', def: 'A logarithmic unit for exposure change. Each stop doubles or halves the amount of light. ISO 100 to 200 is one stop; f/2.8 to f/4 is one stop; 1/125s to 1/250s is one stop.' },
  { term: 'Street Photography', cat: 'Genre', def: 'Candid photography of public life, often with a focus on the human condition, geometry, and decisive moments. Most commonly shot in black and white with a small, unobtrusive camera.' },

  // T
  { term: 'Telephoto', cat: 'Technical', def: 'A lens with a long focal length (typically 70mm and above) that brings distant subjects closer and compresses perspective. Used for portraits, sports, and wildlife.' },
  { term: 'Tripod', cat: 'Gear', def: 'A three-legged support that holds a camera steady for long exposures, self-portraits, panoramas, and any shot where maximum sharpness is critical. The single most useful camera accessory.' },

  // V
  { term: 'Viewfinder', cat: 'Technical', def: 'The eyepiece on a camera that the photographer looks through to compose and focus the shot. Optical (DSLR) or electronic (mirrorless). The defining interface between photographer and scene.' },
  { term: 'Vignetting', cat: 'Aesthetic', def: 'A darkening of the corners of an image relative to the center. Can be an unwanted optical artifact, or a deliberate artistic effect added in post-processing to draw the eye to the subject.' },

  // W
  { term: 'White Balance (WB)', cat: 'Technical', def: 'The camera setting that neutralizes color casts from different light sources (daylight, tungsten, fluorescent). Correct white balance makes whites look white. In RAW, WB can be freely changed in post.' },
  { term: 'Wide Angle', cat: 'Technical', def: 'A lens with a short focal length (typically 35mm or shorter on full-frame) that captures a wide field of view. Used for landscapes, architecture, and environmental portraits. Exaggerates perspective and depth.' },

  // Z
  { term: 'Zone System', cat: 'Historical', def: 'A technique developed by Ansel Adams and Fred Archer for predicting and controlling tonal relationships in black-and-white photography. Divides the tonal range into 11 zones, from pure black to pure white. The foundation of large-format landscape work.' },
  { term: 'Zoom Lens', cat: 'Technical', def: 'A lens with a variable focal length, like a 24-70mm. Convenient for changing framing without changing lenses, but typically not as sharp as a prime lens of the same quality.' },
  { term: '35mm Equivalent', cat: 'Technical', def: 'A way to compare focal lengths across different sensor sizes. A 50mm lens on a full-frame camera is "50mm." A 50mm lens on an APS-C camera has the field of view of a 75mm full-frame lens — so its 35mm equivalent is 75mm.' },
];

(function () {
  const mount = document.getElementById('glossaryMount');
  if (!mount) return;
  const search = document.getElementById('glossarySearch');

  function render(query = '') {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? GLOSSARY.filter(g => g.term.toLowerCase().includes(q) || g.def.toLowerCase().includes(q) || g.cat.toLowerCase().includes(q))
      : GLOSSARY;
    if (filtered.length === 0) {
      mount.innerHTML = `<p class="glossary-empty">No terms match "${query}". Try a broader search.</p>`;
      return;
    }
    // Group by first letter
    const groups = {};
    filtered.forEach(g => {
      const letter = g.term[0].toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(g);
    });
    const letters = Object.keys(groups).sort();
    mount.innerHTML = letters.map(letter => `
      <div class="glossary-letter-group">
        <div class="glossary-letter">${letter}</div>
        <div class="glossary-grid">
          ${groups[letter].map(g => `
            <div class="glossary-term">
              <h3>${g.term}</h3>
              <p>${g.def}</p>
              <span class="term-cat">${g.cat}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  render();
  if (search) {
    let timer;
    search.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => render(search.value), 150);
    });
  }
})();
