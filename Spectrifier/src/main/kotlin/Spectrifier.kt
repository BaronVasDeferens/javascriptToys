import java.awt.image.BufferedImage
import java.io.File
import javax.imageio.ImageIO
import javax.sound.midi.MetaMessage
import kotlin.math.abs
import kotlin.system.exitProcess


enum class ZXSpectrumColor(val r: Int, val g: Int, val b: Int, val hexCode: Int) {
    BLACK(0x00, 0x00, 0x00, 0x000000),

    BLUE(0x01, 0x00, 0xCE, 0x0100CE),
    BLUE_BRIGHT(0x02, 0x00, 0xFD, 0x0200FD),

    RED(0xCF, 0x01, 0x00, 0xCF0100),
    RED_BRIGHT(0xFF, 0x02, 0x01, 0xFF0201),

    MAGENTA(0xCF, 0x01, 0xCE, 0xCF01CE),
    MAGENTA_BRIGHT(0xff, 0x02, 0xFD, 0xFF02FD),

    GREEN(0x00, 0xCF, 0x15, 0x00CF15),
    GREEN_BRIGHT(0x00, 0xFF, 0x1C, 0x00FF1C),

    CYAN(0x01, 0xCF, 0xCF, 0x01CFCF),
    CYAN_BRIGHT(0x02, 0xFF, 0xFF, 0x00FFFF),

    YELLOW(0xCF, 0xCF, 0x15, 0xCFCF15),
    YELLOW_BRIGHT(0xFF, 0xFF, 0x1D, 0xFFFF1D),

    WHITE(0xCF, 0xCF, 0xCF, 0xCFCFCF),
    WHITE_BRIGHT(0xFF, 0xFF, 0xFF, 0xFFFFFF)
}

fun main(args: Array<String>) {

    val source = args.getOrNull(0)
    val destination = args.getOrNull(1)

    if (source == null || destination == null) {
        printUsage()
        exitProcess(1)
    }

    val sourceFile = File(source)
    val outputFile = File(destination)

    // What are we dealing with? Single files or whole directories?
    if (sourceFile.isDirectory) {

        // Create output directory (if needed) and perform error check
        if (!outputFile.exists()) {
            println("Creating output directory: ${outputFile.absolutePath}")
            outputFile.mkdir()
        } else if (outputFile.isFile) {
            printUsage("ERROR: Source (${sourceFile.absolutePath}) a directory, but destination (${outputFile.absolutePath}) is not.")
            printUsage()
            exitProcess(1)
        }

        // MULTIPLE FILES

        sourceFile.listFiles().orEmpty().filter { it.extension == "png" }.forEach { file ->

            println("Converting: ${file.name}...")

            val outFile = File(outputFile, file.name.replace(".png", "_zx.png"))
            val sourceImage = ImageIO.read(file)
            val outputImage = BufferedImage(sourceImage.width, sourceImage.height, BufferedImage.TYPE_INT_ARGB)
            convertImage(sourceImage, outputImage)
            ImageIO.write(outputImage, "PNG", outFile)
        }
    } else if (sourceFile.isFile) {

        // SINGLE FILE

        if (!outputFile.exists()) {
            outputFile.createNewFile()
            println("\t\t...created output file: ${outputFile.absolutePath}")
        }

        println("Converting: ${sourceFile.name}...")

        val sourceImage = ImageIO.read(sourceFile)
        val outputImage = BufferedImage(sourceImage.width, sourceImage.height, BufferedImage.TYPE_INT_ARGB)
        convertImage(sourceImage, outputImage)
        ImageIO.write(outputImage, "PNG", outputFile)
        println("\t\t...DONE! Wrote: ${outputFile.absolutePath}")
    } else {

        // INVALID FILE

        printUsage("Maybe you should read this...")
        exitProcess(1)
    }
}


private fun convertImage(sourceImage: BufferedImage, outputImage: BufferedImage) {

    // Walk across each pixel and map it to the closest ZXSpectrum color
    for (x in 0..<sourceImage.width) {

        for (y in 0..<sourceImage.height) {

            val pixel = sourceImage.getRGB(x, y)

            val pixelAlpha = pixel.ushr(24).and(0xFF)
            val pixelRed = pixel.ushr(16).and(0xFF)
            val pixelGreen = pixel.ushr(8).and(0xFF)
            val pixelBlue = pixel.ushr(0).and(0xFF)

            println("$pixelAlpha $pixelRed $pixelGreen $pixelBlue")

            val closest: Int = ZXSpectrumColor.entries.map { zx ->
                zx to abs(pixelRed - zx.r) + abs(pixelGreen - zx.g) + abs(pixelBlue - zx.b)
            }.minBy { abs(it.second) }
                .first.hexCode
                .or( pixelAlpha.shl(24) )

            outputImage.setRGB(x, y, closest)
        }
    }

}

private fun printUsage(message: String? = null) {

    message?.apply {
        println(this)
    }

    println(
        """
                SPECTRIFIER: Convert PNGs' color to ZX Spectrum's color palette.
                
                USAGE:
                arg 0: SOURCE
                arg 1: DESTINATION
                
                If SOURCE is a single file, the result will be saved to DESTINATION. If DESTINATION does
                not exist
                
                If the source is a DIRECTORY, all files therein will be converted and saved as
                NEW FILES in the destination directory. New files will have the same name as
                their source file, but be appended with "_zx.png"
                 
            """.trimIndent()
    )
}

