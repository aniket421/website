import type { Asset } from './assets';

/**
 * The eight product categories. Read by the nav dropdown, the category rail,
 * the footer and the enquiry form's category select — this is the only list.
 */
export type Category = {
  slug: string;
  title: string;
  /** One line. It appears over the card image, so it has to stay short. */
  description: string;
  image: Asset;
};

export const categories: Category[] = [
  {
    slug: 'designer-tiles',
    title: 'Designer Tiles',
    description: 'Statement surfaces in marble, stone and terrazzo finishes.',
    image: {
      src: null,
      alt: 'Book-matched marble-effect designer tiles on a feature wall',
      width: 900,
      height: 1080,
      // TODO: supply public/assets/categories/designer-tiles.jpg — 900x1080
      expected: 'public/assets/categories/designer-tiles.jpg',
    },
  },
  {
    slug: 'wall-tiles',
    title: 'Wall Tiles',
    description: 'Glazed, matte and textured walls for bathrooms and kitchens.',
    image: {
      src: null,
      alt: 'Textured cream wall tiles behind a wall-hung basin',
      width: 900,
      height: 1080,
      // TODO: supply public/assets/categories/wall-tiles.jpg — 900x1080
      expected: 'public/assets/categories/wall-tiles.jpg',
    },
  },
  {
    slug: 'floor-tiles',
    title: 'Floor Tiles',
    description: 'Anti-skid vitrified floors rated for heavy domestic traffic.',
    image: {
      src: null,
      alt: 'Large-format grey vitrified floor tiles in a lit hallway',
      width: 900,
      height: 1080,
      // TODO: supply public/assets/categories/floor-tiles.jpg — 900x1080
      expected: 'public/assets/categories/floor-tiles.jpg',
    },
  },
  {
    slug: 'sanitaryware',
    title: 'Sanitaryware',
    description: 'Wall-hung and floor-mounted closets with concealed cisterns.',
    image: {
      src: null,
      alt: 'Wall-hung water closet with a concealed cistern and matte black flush plate',
      width: 900,
      height: 1080,
      // TODO: supply public/assets/categories/sanitaryware.jpg — 900x1080
      expected: 'public/assets/categories/sanitaryware.jpg',
    },
  },
  {
    slug: 'faucets',
    title: 'Faucets',
    description: 'Chrome, matte black, brushed gold and rose gold fittings.',
    image: {
      src: null,
      alt: 'Brushed gold basin mixer against a dark stone countertop',
      width: 900,
      height: 1080,
      // TODO: supply public/assets/categories/faucets.jpg — 900x1080
      expected: 'public/assets/categories/faucets.jpg',
    },
  },
  {
    slug: 'wash-basins',
    title: 'Wash Basins',
    description: 'Countertop, under-counter, wall-hung and pedestal basins.',
    image: {
      src: null,
      alt: 'Oval countertop wash basin on a timber vanity',
      width: 900,
      height: 1080,
      // TODO: supply public/assets/categories/wash-basins.jpg — 900x1080
      expected: 'public/assets/categories/wash-basins.jpg',
    },
  },
  {
    slug: 'large-slabs',
    title: 'Large Slabs',
    description: 'Slabs up to 1200×2400 for seamless, near grout-free walls.',
    image: {
      src: null,
      alt: 'A 1200 by 2400 porcelain slab installed as a seamless shower wall',
      width: 900,
      height: 1080,
      // TODO: supply public/assets/categories/large-slabs.jpg — 900x1080
      expected: 'public/assets/categories/large-slabs.jpg',
    },
  },
  {
    slug: 'bathroom-accessories',
    title: 'Bathroom Accessories',
    description: 'Showers, towel rails, mirrors, grab bars and health faucets.',
    image: {
      src: null,
      alt: 'Rain shower head, towel rail and mirror in a brushed brass finish',
      width: 900,
      height: 1080,
      // TODO: supply public/assets/categories/bathroom-accessories.jpg — 900x1080
      expected: 'public/assets/categories/bathroom-accessories.jpg',
    },
  },
];

export const categoryNames = categories.map((category) => category.title);
