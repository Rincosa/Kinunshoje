import SectionTitle from "../../../components/SectionTitle/SectionTitle";
import featuredImg from '../../../assets/home/featured.jpg';
import './Featured.css';

const Featured = () => {
    return (
        <div className="featured-item bg-fixed text-white pt-8 my-20">
            <SectionTitle subHeading="check it out" heading="Featured Item"></SectionTitle>
            <div className="md:flex justify-center items-center bg-slate-500 bg-opacity-60 pb-20 pt-12 px-36">
                <div>
                    <img src={featuredImg}></img>
                </div>
                <div className="md: ml-10">
                    <p>Aug 20, 2029</p>
                    <p className="uppercase">Where can i get some?</p>
                    <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Et eaque amet dolor explicabo quae, dolorum sed consequuntur aliquid alias saepe quos cum totam impedit laudantium, consequatur qui mollitia repellendus excepturi. Hic quas cupiditate non neque sequi quod, dolores commodi fugit qui dicta tenetur, repellat facere iste fugiat, labore possimus magnam!</p>
                    <button className="btn btn-outline border-0 border-b-4">Order Now</button>
                </div>
            </div>
        </div>
    );
};

export default Featured;