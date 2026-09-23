function Home() {
    return null;
}

export default Home;

export function getServerSideProps() {
    return {
        redirect: {
            destination: "/catalog",
            permanent: false,
        },
    };
}
