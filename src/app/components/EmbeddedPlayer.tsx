interface EmbeddedPlayerProps {
    url: string
}

export default function EmbeddedPlayer({ url }: EmbeddedPlayerProps) {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
        const videoId = url.includes("youtu.be")
            ? url.split("youtu.be/")[1]
            : new URL(url).searchParams.get("v")

        if (!videoId) {
            return <p>Video no valido</p>
        }

        return (
            <iframe
                width="100%"
                height="480"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="Youtube player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-xl" 
            />
        )
    }

    if (url.includes("soundcloud.com")) {
        return (
            <iframe
                width="100%"
                height="200"
                scrolling="no"
                frameBorder="no"
                allow="autoplay"
                src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&inverse=false&auto_play=false&show_user=true`}
                className="rounded-xl"
            />
        );
    }

    return <p>URL no soportada</p>;
}
