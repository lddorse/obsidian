const rawAnimations = {
  coffee: {
    frames:[
  `
              (   )     
             (   ) )    
              ) ( (     
            _______)___   
          .-'----------|  
         ( C|/\\/\\/\\/\\/|
          '-./\\/\\/\\/\\/|
            '_________'
            '-._____.--'
                       
                       `,
  `
             (  (      
            )    )     
           (  (  (     
            _______)___   
          .-'----------|  
         ( C|/\\/\\/\\/\\/|
          '-./\\/\\/\\/\\/|
            '_________'
            '-._____.--'
                       
                       `,
  `
               ) (     
              (   )    
             ) (  (    
            _______)___   
          .-'----------|  
         ( C|/\\/\\/\\/\\/|
          '-./\\/\\/\\/\\/|
            '_________'
            '-._____.--'
                       
                       `,
  `
             )   (     
            (  )  )    
             ( (       
            _______)___   
          .-'----------|  
         ( C|/\\/\\/\\/\\/|
          '-./\\/\\/\\/\\/|
            '_________'
            '-._____.--'
                       
                       `,
  `
              (   )    
             )  (  )   
            (   )      
            _______)___   
          .-'----------|  
         ( C|/\\/\\/\\/\\/|
          '-./\\/\\/\\/\\/|
            '_________'
            '-._____.--'
                       
                       `,
  `
             (  )      
            (    (     
             )  )  )   
            _______)___   
          .-'----------|  
         ( C|/\\/\\/\\/\\/|
          '-./\\/\\/\\/\\/|
            '_________'
            '-._____.--'
                       
                       `
],
    speed: 500,
    stillFrame: 1
  },
  
  cocktail: {
    frames: [
      `
                 o
                |
               \\ /
                Y
               / \\
              /≈≈≈\\
             /≈≈≈≈≈\\
            |≈≈≈≈≈≈≈|
             \\     /
              \\   /
               \\ /
                |
               |_|`,
      `
                 o
                |
               \\ /
                Y
               /≈\\
              /≈≈≈\\
             /≈≈≈≈≈\\
            |≈≈≈≈≈≈≈|
             \\     /
              \\   /
               \\ /
                |
               |_|`,
      `
                o
                |
               \\ /
                Y
               / \\
              /≈≈≈\\
             /≈≈≈≈≈\\
            |≈≈≈≈≈≈≈|
             \\     /
              \\   /
               \\ /
                |
               |_|`,
      `
                 o
                 |
               \\ /
                Y
               / \\
              /≈≈≈\\
             /≈≈≈≈≈\\
            |≈≈≈≈≈≈≈|
             \\     /
              \\   /
               \\ /
                |
               |_|`,
      `
                 o
                |
               \\ /
                Y
               / \\
              /≈≈≈\\
             /≈≈≈≈≈\\
            |≈≈≈≈≈≈≈|
             \\     /
              \\   /
               \\ /
                |
               |_|`,
      `
                 o
                 |
               \\ /
                Y
               /≈\\
              /≈≈≈\\
             /≈≈≈≈≈\\
            |≈≈≈≈≈≈≈|
             \\     /
              \\   /
               \\ /
                |
               |_|`
    ],
    speed: 450,
    stillFrame: 1
  },
  
  beer: {
    frames: [
      `
              ╔══╗
              ║  ║
              ║  ║
              ║  ║
              ║  ║
              ║  ║
              ║  ║
             ╔╩══╩╗
             ║    ║
             ║    ║
             ║    ║
             ╚════╝
                  `,
      `
              ╔══╗
              ║  ║
              ║  ║
              ║  ║
              ║  ║
              ║  ║
              ║  ║
             ╔╩══╩╗
             ║    ║
             ║    ║
             ║▓▓▓▓║
             ╚════╝
                  `,
      `
              ╔══╗
              ║  ║
              ║  ║
              ║  ║
              ║  ║
              ║  ║
              ║  ║
             ╔╩══╩╗
             ║    ║
             ║▓▓▓▓║
             ║▓▓▓▓║
             ╚════╝
                  `,
      `
              ╔══╗
              ║  ║
              ║  ║
              ║  ║
              ║  ║
              ║  ║
              ║  ║
             ╔╩══╩╗
             ║▓▓▓▓║
             ║▓▓▓▓║
             ║▓▓▓▓║
             ╚════╝
                  `,
      `
              ╔══╗
              ║  ║
              ║  ║
              ║  ║
              ║  ║
              ║  ║
              ║≈≈║
             ╔╩══╩╗
             ║▓▓▓▓║
             ║▓▓▓▓║
             ║▓▓▓▓║
             ╚════╝
                  `,
      `
              ╔══╗
              ║  ║
              ║  ║
              ║  ║
              ║  ║
              ║≈≈║
              ║≈≈║
             ╔╩══╩╗
             ║▓▓▓▓║
             ║▓▓▓▓║
             ║▓▓▓▓║
             ╚════╝
                  `,
      `
              ╔══╗
              ║  ║
              ║  ║
              ║  ║
              ║≈≈║
              ║≈≈║
              ║≈≈║
             ╔╩══╩╗
             ║▓▓▓▓║
             ║▓▓▓▓║
             ║▓▓▓▓║
             ╚════╝
                  `,
      `
              ╔══╗
              ║  ║
              ║  ║
              ║≈≈║
              ║≈≈║
              ║≈≈║
              ║≈≈║
             ╔╩══╩╗
             ║▓▓▓▓║
             ║▓▓▓▓║
             ║▓▓▓▓║
             ╚════╝
                  `
    ],
    speed: 600,
    stillFrame: 7
  },
  
  snacks: {
    frames: [
      `
            ╔════════╗
            ║ ><)))*>║
            ║--------║
            ║ ><)))*>║
            ║--------║
            ║ ><)))*>║
            ╚════════╝
            ┌────────┐
            │░░░░░░░░│
            │░CRACKERS│
            │░░░░░░░░│
            └────────┘
                     `,
      `
            ╔════════╗
            ║><)))*> ║
            ║--------║
            ║ ><)))*>║
            ║--------║
            ║><)))*> ║
            ╚════════╝
            ┌────────┐
            │░░░░░░░░│
            │░CRACKERS│
            │░░░░░░░░│
            └────────┘
                     `,
      `
            ╔════════╗
            ║ ><)))*>║
            ║--------║
            ║><)))*> ║
            ║--------║
            ║ ><)))*>║
            ╚════════╝
            ┌────────┐
            │░░░░░░░░│
            │░CRACKERS│
            │░░░░░░░░│
            └────────┘
                     `,
      `
            ╔════════╗
            ║><)))*> ║
            ║--------║
            ║ ><)))*>║
            ║--------║
            ║><)))*> ║
            ╚════════╝
            ┌────────┐
            │░░░░░░░░│
            │░CRACKERS│
            │░░░░░░░░│
            └────────┘
                     `
    ],
    speed: 700,
    stillFrame: 0
  }
};

// Pad every frame in an animation to the same line count and width so the
// layout never jumps. Blank edges shared by all frames are trimmed first so
// the art's bounding box is what gets centered; per-frame motion is kept.
const normalizeFrames = (frames) => {
  const lineSets = frames.map((frame) =>
    frame.split('\n').map((line) => line.trimEnd())
  );
  const isBlank = (line) => line === undefined || line === '';

  const top = Math.min(...lineSets.map((lines) => lines.findIndex((l) => !isBlank(l))));
  const bottom = Math.max(...lineSets.map((lines) => lines.findLastIndex((l) => !isBlank(l))));
  const trimmed = lineSets.map((lines) =>
    Array.from({ length: bottom - top + 1 }, (_, i) => lines[top + i] ?? '')
  );

  const indent = Math.min(
    ...trimmed.flat().filter((l) => !isBlank(l)).map((l) => l.search(/\S/))
  );
  const dedented = trimmed.map((lines) => lines.map((l) => l.slice(indent)));

  const width = Math.max(...dedented.flat().map((l) => [...l].length));
  return dedented.map((lines) =>
    lines.map((l) => l + ' '.repeat(width - [...l].length)).join('\n')
  );
};

export const animations = Object.fromEntries(
  Object.entries(rawAnimations).map(([name, animation]) => [
    name,
    { ...animation, frames: normalizeFrames(animation.frames) }
  ])
);
